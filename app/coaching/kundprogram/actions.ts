"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireClinicStaff } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, escapeHtml } from "@/lib/brevo";
import {
  CLINIC_PROGRAM_VIDEO_BUCKET,
  MAX_CLINIC_PROGRAM_VIDEO_BYTES,
} from "@/lib/clinic-program-video";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createClinicProgramVideoUploadUrl(
  fileName: string,
  fileSize: number,
  mime: string,
) {
  await requireClinicStaff();

  if (!mime.startsWith("video/")) {
    throw new Error("Bara videofiler kan laddas upp.");
  }
  if (fileSize > MAX_CLINIC_PROGRAM_VIDEO_BYTES) {
    throw new Error("Filen är för stor (max 100 MB).");
  }

  const admin = createAdminClient();
  const ext = fileName.split(".").pop()?.toLowerCase() || "mp4";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { data, error } = await admin.storage
    .from(CLINIC_PROGRAM_VIDEO_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error("Kunde inte förbereda uppladdningen.");
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(CLINIC_PROGRAM_VIDEO_BUCKET).getPublicUrl(path);

  return { path, token: data.token, publicUrl };
}

// exerciseIds/notes/customTitles/customVideoUrls är parallella listor (en
// per rad i byggaren, i ordning) — en rad är antingen en biblioteks-övning
// (exerciseId satt, customTitle tom) eller en egen övning (tvärtom).
function buildProgramExerciseRows(
  clinicProgramId: string,
  formData: FormData,
) {
  const exerciseIds = formData.getAll("exerciseIds") as string[];
  const notes = formData.getAll("notes") as string[];
  const customTitles = formData.getAll("customTitles") as string[];
  const customVideoUrls = formData.getAll("customVideoUrls") as string[];

  const rows = exerciseIds
    .map((exerciseId, i) => {
      const customTitle = customTitles[i]?.trim();
      const customVideoUrl = customVideoUrls[i]?.trim();
      const rowNotes = notes[i]?.trim() || null;

      if (customTitle && customVideoUrl) {
        return {
          clinic_program_id: clinicProgramId,
          exercise_id: null,
          custom_title: customTitle,
          custom_video_url: customVideoUrl,
          notes: rowNotes,
          order_index: i,
        };
      }
      if (!exerciseId) return null;
      return {
        clinic_program_id: clinicProgramId,
        exercise_id: exerciseId,
        notes: rowNotes,
        order_index: i,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  // Sista skyddsnät mot clinic_program_exercises_unique_exercise (unique
  // per program+övning): slår ihop ev. rader med samma exercise_id istället
  // för att låta inserten misslyckas — builderns UI ska redan förhindra
  // detta (se parseNotes/add i ClinicProgramBuilder.tsx), men det här gör
  // sparandet robust även om en dubblett ändå slinker igenom.
  const seenExerciseIds = new Map<string, number>();
  const deduped: typeof rows = [];
  for (const row of rows) {
    if (row.exercise_id === null) {
      deduped.push(row);
      continue;
    }
    const existingIndex = seenExerciseIds.get(row.exercise_id);
    if (existingIndex === undefined) {
      seenExerciseIds.set(row.exercise_id, deduped.length);
      deduped.push(row);
    } else {
      const existing = deduped[existingIndex];
      deduped[existingIndex] = {
        ...existing,
        notes: [existing.notes, row.notes].filter(Boolean).join(" / ") || null,
      };
    }
  }
  return deduped;
}

export async function createClinicProgram(formData: FormData) {
  await requireClinicStaff();

  const label = (formData.get("label") as string)?.trim();
  const rowCount = formData.getAll("exerciseIds").length;

  if (!label || rowCount === 0) {
    return;
  }

  const admin = createAdminClient();
  const shareToken = randomBytes(6).toString("base64url");

  const { data: program, error } = await admin
    .from("clinic_programs")
    .insert({ label, share_token: shareToken })
    .select("id")
    .single();

  if (error || !program) {
    return;
  }

  const rows = buildProgramExerciseRows(program.id, formData);
  if (rows.length > 0) {
    const { error: rowsError } = await admin.rpc("replace_clinic_program_exercises", {
      p_clinic_program_id: program.id,
      p_rows: rows,
    });
    if (rowsError) {
      // Programmet skapades men övningarna kunde inte sparas — städa bort
      // det tomma programmet istället för att lämna en delningslänk som
      // alltid ger 404. Loggar hela felet (inte bara antagandet "dubblett")
      // så en oväntad orsak går att felsöka via server-loggen.
      console.error("replace_clinic_program_exercises failed (create)", rowsError);
      await admin.from("clinic_programs").delete().eq("id", program.id);
      redirect("/coaching/kundprogram/ny?error=1");
    }
  }

  revalidatePath("/coaching/kundprogram");
  redirect(`/coaching/kundprogram/${program.id}?ny=1`);
}

export async function updateClinicProgram(
  clinicProgramId: string,
  formData: FormData,
) {
  await requireClinicStaff();

  const label = (formData.get("label") as string)?.trim();
  const rowCount = formData.getAll("exerciseIds").length;

  if (!label || rowCount === 0) {
    return;
  }

  const admin = createAdminClient();

  // Delningslänken (share_token) rörs aldrig — den redan utskickade länken
  // ska fortsätta peka på samma program, bara med uppdaterat innehåll.
  await admin
    .from("clinic_programs")
    .update({ label })
    .eq("id", clinicProgramId);

  const rows = buildProgramExerciseRows(clinicProgramId, formData);
  // Byte av övningslista görs i en enda transaktion (delete+insert i
  // replace_clinic_program_exercises) — om inserten misslyckas (t.ex. samma
  // övning tillagd två gånger) rullas raderingen tillbaka automatiskt, så
  // kundens redan skickade länk fortsätter peka på det gamla, fungerande
  // innehållet istället för att tystas ner till ett tomt program.
  const { error: rowsError } = await admin.rpc("replace_clinic_program_exercises", {
    p_clinic_program_id: clinicProgramId,
    p_rows: rows,
  });
  if (rowsError) {
    console.error("replace_clinic_program_exercises failed (update)", rowsError);
    redirect(`/coaching/kundprogram/${clinicProgramId}/redigera?error=1`);
  }

  revalidatePath("/coaching/kundprogram");
  revalidatePath(`/coaching/kundprogram/${clinicProgramId}`);
  redirect(`/coaching/kundprogram/${clinicProgramId}`);
}

export async function sendClinicProgramLink(
  clinicProgramId: string,
  formData: FormData,
): Promise<{ ok: boolean }> {
  await requireClinicStaff();

  const email = (formData.get("email") as string)?.trim();
  if (!email || !isValidEmail(email)) {
    return { ok: false };
  }

  const admin = createAdminClient();
  const { data: program } = await admin
    .from("clinic_programs")
    .select("label, share_token")
    .eq("id", clinicProgramId)
    .maybeSingle();

  if (!program) {
    return { ok: false };
  }

  const link = `https://www.realignmetoden.se/p/${program.share_token}`;
  const safeLabel = escapeHtml(program.label);

  try {
    await sendEmail({
      to: [{ email }],
      subject: "Ditt träningsprogram från ReAlign Metoden",
      replyTo: { email: "kontakt@realignmetoden.se", name: "ReAlign Metoden" },
      html: buildClinicProgramEmailHtml(safeLabel, link),
      text: `Hej!\n\nHär är länken till ditt träningsprogram, ${program.label}:\n${link}\n\nInget konto behövs — klicka bara på länken för att komma igång.\n\nVänliga hälsningar,\nReAlign Metoden`,
    });
  } catch (e) {
    console.error("Failed to send clinic program email", e);
    return { ok: false };
  }

  await admin
    .from("clinic_programs")
    .update({ sent_to_email: email, sent_at: new Date().toISOString() })
    .eq("id", clinicProgramId);

  revalidatePath(`/coaching/kundprogram/${clinicProgramId}`);
  return { ok: true };
}

function buildClinicProgramEmailHtml(safeLabel: string, url: string) {
  return `
<div style="background:#fafaf7;padding:32px 16px;">
  <div style="max-width:440px;margin:0 auto;background:#ffffff;border-radius:16px;padding:32px 28px;border:1px solid #dadfd8;">
    <div style="margin-bottom:24px;">
      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#5e7461;vertical-align:middle;margin-right:8px;"></span
      ><span style="font-family:Georgia,'Times New Roman',serif;font-size:19px;color:#2b2e2a;vertical-align:middle;">ReAlign</span>
    </div>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2b2e2a;line-height:1.5;margin:0 0 16px;">Hej!</p>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#2b2e2a;line-height:1.5;margin:0 0 24px;">
      Här är länken till ditt träningsprogram, <b>${safeLabel}</b>:
    </p>
    <div style="text-align:center;margin:0 0 20px;">
      <a href="${url}" style="display:inline-block;background:#d98e5c;color:#2b2e2a;font-family:Arial,Helvetica,sans-serif;font-weight:bold;font-size:14px;text-decoration:none;padding:12px 28px;border-radius:100px;">Öppna ditt program →</a>
    </div>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7267;line-height:1.5;margin:0 0 24px;">
      Inget konto behövs — klicka bara på länken för att komma igång.
    </p>
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7267;line-height:1.5;margin:0;">
      Vänliga hälsningar,<br>ReAlign Metoden
    </p>
  </div>
</div>`;
}

export async function deleteClinicProgram(clinicProgramId: string) {
  await requireClinicStaff();
  const admin = createAdminClient();

  await admin.from("clinic_programs").delete().eq("id", clinicProgramId);

  revalidatePath("/coaching/kundprogram");
  redirect("/coaching/kundprogram");
}
