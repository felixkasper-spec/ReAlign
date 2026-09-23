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

// Next.js döljer thrown Error-meddelanden från Server Actions i
// produktionsbyggen (av säkerhetsskäl — samma "digest"-only-beteende som
// bakom React-felkod #441) — därför måste fel returneras som {ok:false,
// error} precis som resten av action-filerna i appen, annars ser
// användaren bara en kryptisk generisk textsträng istället för det
// faktiska felet.
export async function createClinicProgramVideoUploadUrl(
  fileName: string,
  fileSize: number,
  mime: string,
): Promise<
  | { ok: true; path: string; token: string; publicUrl: string }
  | { ok: false; error: string }
> {
  await requireClinicStaff();

  if (!mime.startsWith("video/")) {
    return { ok: false, error: "Bara videofiler kan laddas upp." };
  }
  if (fileSize > MAX_CLINIC_PROGRAM_VIDEO_BYTES) {
    return { ok: false, error: "Filen är för stor (max 100 MB)." };
  }

  const admin = createAdminClient();
  const ext = fileName.split(".").pop()?.toLowerCase() || "mp4";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { data, error } = await admin.storage
    .from(CLINIC_PROGRAM_VIDEO_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("createClinicProgramVideoUploadUrl — kunde inte förbereda uppladdning:", error);
    return { ok: false, error: "Kunde inte förbereda uppladdningen." };
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(CLINIC_PROGRAM_VIDEO_BUCKET).getPublicUrl(path);

  return { ok: true, path, token: data.token, publicUrl };
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

  // Samma övning får förekomma flera gånger i samma program (t.ex. både som
  // uppvärmning och nedvarvning) — ingen dedupp här, se migration
  // 0059_allow_repeated_clinic_program_exercises.sql som tog bort
  // databasens unique-spärr per övning/program.
  return exerciseIds
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
}

export type CreateProgramResult =
  | { ok: true; id: string; shareToken: string; label: string }
  | { ok: false; error: string; rowsFailedDetail?: string };

// Delad av createClinicProgram (redirectar till programmets egen sida) och
// createClinicProgramInline (returnerar resultatet istället, för att kunna
// visa delningslänk + skicka-knappar direkt på kundens sida utan att lämna
// den — se app/coaching/kunder/[phone]/ProgramFromJournal.tsx).
async function insertClinicProgram(formData: FormData): Promise<CreateProgramResult> {
  const label = (formData.get("label") as string)?.trim();
  const rowCount = formData.getAll("exerciseIds").length;

  if (!label || rowCount === 0) {
    return { ok: false, error: "Namn och minst en övning krävs." };
  }

  const admin = createAdminClient();
  const shareToken = randomBytes(6).toString("base64url");

  // Sätts bara när programmet skapas från en kunds profil (dolda fält i
  // formuläret, se kundprogram/ny/page.tsx och kundens sida) — annars null
  // precis som tidigare, fristående program.
  const customerPhone = (formData.get("customer_phone") as string)?.trim() || null;
  const customerName = (formData.get("customer_name") as string)?.trim() || null;
  const customerEmail = (formData.get("customer_email") as string)?.trim() || null;

  const { data: program, error } = await admin
    .from("clinic_programs")
    .insert({
      label,
      share_token: shareToken,
      customer_phone: customerPhone,
      customer_name: customerName,
      customer_email: customerEmail,
    })
    .select("id")
    .single();

  if (error || !program) {
    return { ok: false, error: "Kunde inte skapa programmet." };
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
      // alltid ger 404. Skickar med det faktiska DB-felet i URL:en (inte
      // bara antagandet "dubblett") så den syns direkt i UI:t — det gick
      // inte längre att lita på att orsaken alltid var en dubblett.
      console.error("replace_clinic_program_exercises failed (create)", rowsError);
      await admin.from("clinic_programs").delete().eq("id", program.id);
      return { ok: false, error: "Kunde inte spara övningarna.", rowsFailedDetail: rowsError.message };
    }
  }

  if (customerPhone) revalidatePath(`/coaching/kunder/${customerPhone}`);
  revalidatePath("/coaching/kundprogram");
  return { ok: true, id: program.id, shareToken, label };
}

export async function createClinicProgram(formData: FormData) {
  await requireClinicStaff();

  const result = await insertClinicProgram(formData);
  if (!result.ok) {
    if (result.rowsFailedDetail) {
      redirect(
        `/coaching/kundprogram/ny?error=1&detail=${encodeURIComponent(result.rowsFailedDetail)}`,
      );
    }
    return;
  }

  redirect(`/coaching/kundprogram/${result.id}?ny=1`);
}

// Samma skapande-logik som createClinicProgram, men returnerar resultatet
// istället för att redirecta — används med useActionState() från kundens
// sida (ProgramFromJournal.tsx) så att delningslänk + skicka-knappar kan
// visas direkt där utan sidbyte.
export async function createClinicProgramInline(
  _prevState: CreateProgramResult,
  formData: FormData,
): Promise<CreateProgramResult> {
  await requireClinicStaff();
  return insertClinicProgram(formData);
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
  // replace_clinic_program_exercises) — om inserten misslyckas av någon
  // anledning rullas raderingen tillbaka automatiskt, så kundens redan
  // skickade länk fortsätter peka på det gamla, fungerande innehållet
  // istället för att tystas ner till ett tomt program.
  const { error: rowsError } = await admin.rpc("replace_clinic_program_exercises", {
    p_clinic_program_id: clinicProgramId,
    p_rows: rows,
  });
  if (rowsError) {
    console.error("replace_clinic_program_exercises failed (update)", rowsError);
    redirect(
      `/coaching/kundprogram/${clinicProgramId}/redigera?error=1&detail=${encodeURIComponent(rowsError.message)}`,
    );
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
