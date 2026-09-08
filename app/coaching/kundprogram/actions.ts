"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createClinicProgram(formData: FormData) {
  await requireCoach();

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
  redirect(`/coaching/kundprogram/${program.id}`);
}

export async function deleteClinicProgram(clinicProgramId: string) {
  await requireCoach();
  const admin = createAdminClient();

  await admin.from("clinic_programs").delete().eq("id", clinicProgramId);

  revalidatePath("/coaching/kundprogram");
  redirect("/coaching/kundprogram");
}
