"use server";

import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function confirmEmail(token_hash: string, type: EmailOtpType) {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (!error) {
    redirect("/min-sida");
  }

  redirect("/login?error=Länken är ogiltig eller har gått ut.");
}
