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

export default async function NewClinicProgramPage() {
  await requireClinicStaff();
  const admin = createAdminClient();

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

        <ClinicProgramBuilder exercises={exercises ?? []} action={createClinicProgram} />

        <Footer />
      </div>
    </>
  );
}
