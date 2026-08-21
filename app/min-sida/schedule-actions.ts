"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function scheduleSession(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = (formData.get("title") as string)?.trim();
  const programId = (formData.get("programId") as string) || null;
  const date = formData.get("date") as string;
  const time = formData.get("time") as string;

  if (!title || !date || !time) {
    return;
  }

  const scheduledFor = new Date(`${date}T${time}`);
  if (Number.isNaN(scheduledFor.getTime())) {
    return;
  }

  // Skydd mot dubbel-inskick (dubbelklick, långsamt nät som gör att
  // formuläret skickas två gånger): hoppa över om exakt samma pass
  // redan skapades för några sekunder sedan.
  const { data: recentDuplicate } = await supabase
    .from("logged_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("title", title)
    .eq("scheduled_for", scheduledFor.toISOString())
    .gte("created_at", new Date(Date.now() - 10_000).toISOString())
    .maybeSingle();

  if (!recentDuplicate) {
    await supabase.from("logged_sessions").insert({
      user_id: user.id,
      program_id: programId || null,
      title,
      scheduled_for: scheduledFor.toISOString(),
    });
  }

  revalidatePath("/min-sida");
}

export async function logSessionNow(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = (formData.get("title") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!title) {
    return;
  }

  await supabase.from("logged_sessions").insert({
    user_id: user.id,
    title,
    notes,
    completed_at: new Date().toISOString(),
  });

  revalidatePath("/min-sida");
}

export async function markSessionDone(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("logged_sessions")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  revalidatePath("/min-sida");
}

export async function deleteSession(sessionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("logged_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);

  revalidatePath("/min-sida");
}
