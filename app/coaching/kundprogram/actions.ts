"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireClinicStaff } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail, escapeHtml } from "@/lib/brevo";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createClinicProgram(formData: FormData) {
  await requireClinicStaff();

  const label = (formData.get("label") as string)?.trim();
  const exerciseIds = formData.getAll("exerciseIds") as string[];
  const notes = formData.getAll("notes") as string[];

  if (!label || exerciseIds.length === 0) {
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

  await admin.from("clinic_program_exercises").insert(
    exerciseIds.map((exerciseId, i) => ({
      clinic_program_id: program.id,
      exercise_id: exerciseId,
      notes: notes[i]?.trim() || null,
      order_index: i,
    })),
  );

  revalidatePath("/coaching/kundprogram");
  redirect(`/coaching/kundprogram/${program.id}?ny=1`);
}

export async function updateClinicProgram(
  clinicProgramId: string,
  formData: FormData,
) {
  await requireClinicStaff();

  const label = (formData.get("label") as string)?.trim();
  const exerciseIds = formData.getAll("exerciseIds") as string[];
  const notes = formData.getAll("notes") as string[];

  if (!label || exerciseIds.length === 0) {
    return;
  }

  const admin = createAdminClient();

  // Delningslänken (share_token) rörs aldrig — den redan utskickade länken
  // ska fortsätta peka på samma program, bara med uppdaterat innehåll.
  await admin
    .from("clinic_programs")
    .update({ label })
    .eq("id", clinicProgramId);
  await admin
    .from("clinic_program_exercises")
    .delete()
    .eq("clinic_program_id", clinicProgramId);
  await admin.from("clinic_program_exercises").insert(
    exerciseIds.map((exerciseId, i) => ({
      clinic_program_id: clinicProgramId,
      exercise_id: exerciseId,
      notes: notes[i]?.trim() || null,
      order_index: i,
    })),
  );

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
      subject: "Ditt träningsprogram från Cleer Klinik",
      replyTo: { email: "kontakt@realignmetoden.se", name: "ReAlign Metoden" },
      html: buildClinicProgramEmailHtml(safeLabel, link),
      text: `Hej!\n\nHär är länken till ditt träningsprogram, ${program.label}:\n${link}\n\nInget konto behövs — klicka bara på länken för att komma igång.\n\nVänliga hälsningar,\nCleer Klinik`,
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
      Vänliga hälsningar,<br>Cleer Klinik
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
