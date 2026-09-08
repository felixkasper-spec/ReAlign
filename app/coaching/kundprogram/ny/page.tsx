import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClinicProgram } from "../actions";
import ClinicProgramBuilder from "../ClinicProgramBuilder";
import styles from "../../page.module.css";

export default async function NewClinicProgramPage() {
  await requireCoach();
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
        <span className="eyebrow">Coach-verktyg</span>
        <h1>Nytt kundprogram</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 24 }}>
          Klistra in dina anteckningar (ett format som{" "}
          <i>&quot;Spidey crawls - 2x45 sekunder&quot;</i> per rad) så matchas
          övningarna automatiskt — eller lägg till dem för hand nedan.
        </p>

        <ClinicProgramBuilder exercises={exercises ?? []} action={createClinicProgram} />

        <Footer />
      </div>
    </>
  );
}
