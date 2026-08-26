"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";

export async function createCustomProgram(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subscription = await getSubscription();
  if (!subscription.active) {
    redirect("/premium");
  }

  const title = (formData.get("title") as string)?.trim();
  const exerciseIds = formData.getAll("exerciseIds") as string[];

  if (!title || exerciseIds.length === 0) {
    return;
  }

  const { data: program, error } = await supabase
    .from("custom_programs")
    .insert({ user_id: user.id, title })
    .select("id")
    .single();

  if (error || !program) {
    return;
  }

  await supabase.from("custom_program_exercises").insert(
    exerciseIds.map((exerciseId, i) => ({
      custom_program_id: program.id,
      exercise_id: exerciseId,
      order_index: i,
    })),
  );

  revalidatePath("/min-sida");
  redirect(`/min-sida/mina-program/${program.id}`);
}

export async function deleteCustomProgram(customProgramId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("custom_programs")
    .delete()
    .eq("id", customProgramId)
    .eq("user_id", user.id);

  revalidatePath("/min-sida");
  redirect("/min-sida");
}

export async function logCustomProgramCompletion(
  customProgramId: string,
  title: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: recentDuplicate } = await supabase
    .from("logged_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("custom_program_id", customProgramId)
    .gte("created_at", new Date(Date.now() - 10_000).toISOString())
    .maybeSingle();

  if (!recentDuplicate) {
    await supabase.from("logged_sessions").insert({
      user_id: user.id,
      custom_program_id: customProgramId,
      title,
      completed_at: new Date().toISOString(),
    });
  }

  revalidatePath("/min-sida");
  revalidatePath("/min-sida/mina-program/[id]", "page");
}
