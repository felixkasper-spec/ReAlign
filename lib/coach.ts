import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Enda "admin-gaten" i kodbasen — det finns inget roller/rättighetssystem,
 * så coach-inkorgen skyddas genom att jämföra inloggad e-post mot en
 * env-variabel istället.
 */
export async function requireCoach() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !process.env.COACH_EMAIL || user.email !== process.env.COACH_EMAIL) {
    redirect("/");
  }

  return user;
}
