"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBaseUrl } from "@/lib/base-url";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const origin = await getBaseUrl();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.session) {
    // "Confirm email" är avstängt i Supabase — kontot är redan aktivt.
    redirect("/min-sida");
  }

  redirect("/signup?success=1");
}
