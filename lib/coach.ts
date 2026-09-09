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

// Delad av requireClinicStaff() och Header (som bara vill veta om den ska
// visa en menylänk, utan att omdirigera icke-personal bort från sidan).
export function isClinicStaffEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  if (process.env.COACH_EMAIL && email === process.env.COACH_EMAIL) return true;

  const staffEmails = (process.env.CLINIC_STAFF_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return staffEmails.includes(email.toLowerCase());
}

/**
 * Bredare gate för kundprogram-verktyget specifikt: coachen själv, plus
 * övrig klinikpersonal listad i CLINIC_STAFF_EMAILS (kommaseparerad
 * e-postlista). Medvetet SKILD från requireCoach() — kundprogram innehåller
 * inget känsligt om enskilda Premium Coaching-kunder eller
 * kontaktmeddelanden, så klinikpersonal ska kunna skapa/redigera
 * kundprogram utan att få tillgång till coach-inkorgen i övrigt.
 */
export async function requireClinicStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isClinicStaffEmail(user?.email)) {
    redirect("/");
  }

  return user!;
}
