import type { Metadata } from "next";
import Link from "next/link";
import { requireClinicStaff } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClinicProgram } from "../actions";
import ClinicProgramBuilder from "../ClinicProgramBuilder";
import styles from "../../page.module.css";

export const metadata: Metadata = { title: "Nytt kundprogram — ReAlign Metoden" };

export default async function NewClinicProgramPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; detail?: string }>;
}) {
  await requireClinicStaff();
  const admin = createAdminClient();
  const { error, detail } = await searchParams;

  const { data: exercises } = await admin
    .from("exercises")
    .select("id, slug, title, body_part")
    .order("body_part")
    .order("title");

  return (
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
            Kunde inte spara övningarna, försök igen.
            {detail && (
              <>
                <br />
                <span style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                  Feldetalj: {detail}
                </span>
              </>
            )}
          </p>
        )}

        <ClinicProgramBuilder exercises={exercises ?? []} action={createClinicProgram} />
      </div>
  );
}
