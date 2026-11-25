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

// doneCount/totalCount är valfria — anropas utan dem från den vanliga
// "slutfört programmet"-vägen (oförändrat beteende), och med dem från
// ProgramPlayer (se logProgramProgress-anropet i komponenten) både vid en
// full genomkörning och när man avslutar i förtid. doneCount < totalCount
// loggas ändå som ett genomfört pass (ansträngningen räknas), bara med
// antalet synligt i anteckningen.
export async function logProgramCompletion(
  programId: string,
  title: string,
  doneCount?: number,
  totalCount?: number,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Skydd mot dubbelklick — hoppa över om samma program precis loggades
  // klart för några sekunder sedan.
  const { data: recentDuplicate } = await supabase
    .from("logged_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("program_id", programId)
    .gte("created_at", new Date(Date.now() - 10_000).toISOString())
    .maybeSingle();

  const partial = doneCount != null && totalCount != null && doneCount < totalCount;

  if (!recentDuplicate) {
    await supabase.from("logged_sessions").insert({
      user_id: user.id,
      program_id: programId,
      title,
      notes: partial ? `${doneCount} av ${totalCount} övningar` : null,
      completed_at: new Date().toISOString(),
    });
  }

  revalidatePath("/min-sida");
  revalidatePath("/program/[slug]", "page");
}

// Ren form-action-kompatibel variant av logProgramCompletion ovan — en
// <form action={...}> kräver att sista parametern är FormData, vilket
// doneCount/totalCount-utökningen bröt för de manuella "✓ Markera som
// klar"-knapparna (5-minuter/page.tsx, program/[slug]/page.tsx). Samma
// logik, bara en hel genomkörning (inga räknare).
export async function logProgramCompletionForm(
  programId: string,
  title: string,
  _formData: FormData,
) {
  await logProgramCompletion(programId, title);
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
