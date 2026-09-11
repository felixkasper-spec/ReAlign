import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireClinicStaff } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import ContentStudioClient from "./ContentStudioClient";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Content Studio — ReAlign Metoden" };

export default async function ContentStudioPage() {
  const user = await requireClinicStaff();
  const isCoach = user.email === process.env.COACH_EMAIL;
  const admin = createAdminClient();

  const { data: exercises } = await admin
    .from("exercises")
    .select("id, slug, title, body_part, sets_reps, instructions")
    .order("body_part")
    .order("title");

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        {isCoach && (
          <Link href="/coaching" className={styles.back}>
            ← Coach-inkorg
          </Link>
        )}
        <span className="eyebrow">Coach-verktyg</span>
        <h1>Content Studio</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 24 }}>
          Generera varumärkesanpassade Instagram-bilder utifrån era övningar — välj en övning,
          justera texten om du vill, och ladda ner som PNG.
        </p>

        <ContentStudioClient exercises={exercises ?? []} />

        <Footer />
      </div>
    </>
  );
}
