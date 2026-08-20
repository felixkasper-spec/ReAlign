"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(exerciseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Du måste vara inloggad för att spara favoriter.");
  }

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("exercise_id", exerciseId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("favorites")
      .insert({ user_id: user.id, exercise_id: exerciseId });
  }

  revalidatePath("/ovningsbank");
  revalidatePath("/min-sida");

  return { favorited: !existing };
}
