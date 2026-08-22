"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBaseUrl } from "@/lib/base-url";

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const origin = await getBaseUrl();

  const firstName = (formData.get("firstName") as string)?.trim();
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

  if (data.user && firstName) {
    // Ingen session finns ännu om e-postbekräftelse krävs, så en vanlig
    // RLS-skyddad update skulle tyst misslyckas — service role-klienten
    // kringgår det och funkar oavsett bekräftelseinställning.
    const admin = createAdminClient();
    await admin
      .from("profiles")
      .update({ display_name: firstName })
      .eq("id", data.user.id);
  }

  if (data.session) {
    // "Confirm email" är avstängt i Supabase — kontot är redan aktivt.
    redirect("/min-sida");
  }

  redirect("/signup?success=1");
}
