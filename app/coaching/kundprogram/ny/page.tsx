import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireClinicStaff } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClinicProgram } from "../actions";
import ClinicProgramBuilder from "../ClinicProgramBuilder";
import styles from "../../page.module.css";

export const metadata: Metadata = { title: "Nytt kundprogram — ReAlign Metoden" };

export default async function NewClinicProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireClinicStaff();
  const admin = createAdminClient();
  const { error } = await searchParams;

  const { data: exercises } = await admin
    .from("exercises")
    .select("id, slug, title, body_part")
    .order("body_part")
    .order("title");

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <Link href="/coaching/kundprogram" className={styles.back}>
          ← Kundprogram
        </Link>
        <h1 style={{ marginBottom: 24 }}>Nytt kundprogram</h1>

        {error === "1" && (
          <p
            style={{
              background: "var(--warm-soft)",
              color: "#5a4530",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: "0.9rem",
              marginBottom: 20,
            }}
          >
            Kunde inte spara övningarna — kontrollera att ingen övning ligger
            med två gånger i listan, och försök igen.
          </p>
        )}

        <ClinicProgramBuilder exercises={exercises ?? []} action={createClinicProgram} />

        <Footer />
      </div>
    </>
  );
}
