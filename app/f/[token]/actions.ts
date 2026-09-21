"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

function optionalText(formData: FormData, key: string): string | null {
  const value = (formData.get(key) as string)?.trim();
  return value ? value : null;
}

function optionalInt(formData: FormData, key: string): number | null {
  const value = (formData.get(key) as string)?.trim();
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

// Ingen inloggning — formuläret nås via en slumpad token i länken, som
// fungerar som hela behörighetskontrollen (samma mönster som /p/[token] för
// delade kundprogram). Token valideras här innan något läses eller skrivs.
async function requireIntakeByToken(token: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("customer_intake_forms")
    .select("id, customer_phone")
    .eq("token", token)
    .maybeSingle();
  return data;
}

export async function submitIntake(
  token: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const intake = await requireIntakeByToken(token);
  if (!intake) {
    return { ok: false, error: "Länken är ogiltig eller har gått ut." };
  }

  const symptoms = (formData.get("symptoms") as string)?.trim();
  if (!symptoms) {
    return { ok: false, error: "Beskriv gärna vad du vill ha hjälp med." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("customer_intake_forms")
    .update({
      customer_name: optionalText(formData, "customer_name") ?? undefined,
      height_cm: optionalInt(formData, "height_cm"),
      weight_kg: optionalInt(formData, "weight_kg"),
      symptoms,
      pain_level: optionalInt(formData, "pain_level"),
      previous_injuries: optionalText(formData, "previous_injuries"),
      medications: optionalText(formData, "medications"),
      sedentary_work: optionalText(formData, "sedentary_work"),
      sleep_habits: optionalText(formData, "sleep_habits"),
      current_training: optionalText(formData, "current_training"),
      equipment_access: optionalText(formData, "equipment_access"),
      session_length: optionalText(formData, "session_length"),
      goals: optionalText(formData, "goals"),
      other_info: optionalText(formData, "other_info"),
      submitted_at: new Date().toISOString(),
    })
    .eq("id", intake.id);

  if (error) {
    console.error("submitIntake — kunde inte spara:", error);
    return { ok: false, error: "Något gick fel — testa igen om en stund." };
  }

  revalidatePath(`/f/${token}`);
  return { ok: true };
}
