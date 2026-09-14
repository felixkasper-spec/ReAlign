"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";

async function requireCoachingUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subscription = await getSubscription();
  if (!subscription.active || subscription.plan !== "premium_coaching") {
    redirect("/min-sida");
  }

  return { supabase, user };
}

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

type PhotoSlotPaths = {
  front: string | null;
  back: string | null;
  left: string | null;
  right: string | null;
};

export async function submitCoachingIntake(
  photoPaths: PhotoSlotPaths,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, user } = await requireCoachingUser();

  const symptoms = (formData.get("symptoms") as string)?.trim();
  if (!symptoms) {
    return { ok: false, error: "Beskriv gärna dina symptom/problem." };
  }

  const { error } = await supabase.from("coaching_intake").upsert(
    {
      user_id: user.id,
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
      weekly_time_budget: optionalText(formData, "weekly_time_budget"),
      goals: optionalText(formData, "goals"),
      other_info: optionalText(formData, "other_info"),
      photo_front_path: photoPaths.front,
      photo_back_path: photoPaths.back,
      photo_left_path: photoPaths.left,
      photo_right_path: photoPaths.right,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false, error: "Något gick fel — testa igen om en stund." };
  }

  revalidatePath("/min-sida/coaching/formular");
  return { ok: true };
}

export async function getCoachingIntake() {
  const { supabase, user } = await requireCoachingUser();
  const { data } = await supabase
    .from("coaching_intake")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  return data;
}
