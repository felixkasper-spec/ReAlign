"use server";

import { revalidatePath } from "next/cache";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";

export async function replyToCoachingThread(userId: string, formData: FormData) {
  await requireCoach();

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return;
  }

  const admin = createAdminClient();

  await admin.from("coaching_messages").insert({
    user_id: userId,
    sender: "coach",
    body,
  });

  await admin
    .from("coaching_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("sender", "user")
    .is("read_at", null);

  revalidatePath(`/coaching/${userId}`);
  revalidatePath("/coaching");
}

export async function markContactMessageRead(messageId: string) {
  await requireCoach();

  const admin = createAdminClient();
  await admin
    .from("contact_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId);

  revalidatePath("/coaching");
}
