import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireClinicStaff } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteClinicProgram } from "../actions";
import CopyLinkButton from "./CopyLinkButton";
import SendLinkForm from "./SendLinkForm";
import styles from "../../page.module.css";

export const metadata: Metadata = { title: "Kundprogram — ReAlign Metoden" };

export default async function ClinicProgramDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ny?: string }>;
}) {
  await requireClinicStaff();
  const { id } = await params;
  const { ny } = await searchParams;
  const admin = createAdminClient();

  const { data: program } = await admin
    .from("clinic_programs")
    .select(
      "id, label, share_token, visit_count, last_visited_at, sent_to_email, sent_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (!program) notFound();

  const { data: rows } = await admin
    .from("clinic_program_exercises")
    .select("notes, order_index, exercises ( title )")
    .eq("clinic_program_id", id)
    .order("order_index");

  const link = `https://www.realignmetoden.se/p/${program.share_token}`;

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <Link href="/coaching/kundprogram" className={styles.back}>
          ← Kundprogram
        </Link>
        <span className="eyebrow">Kundprogram skapat</span>
        <h1>{program.label}</h1>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "16px 18px",
            margin: "16px 0 28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <code style={{ fontSize: "0.85rem", wordBreak: "break-all" }}>
              {link}
            </code>
            <CopyLinkButton link={link} autoCopy={ny === "1"} />
          </div>

          <SendLinkForm clinicProgramId={program.id} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ color: "var(--text-soft)", fontSize: "0.88rem" }}>
            {program.visit_count > 0 ? (
              <>
                Öppnad <b>{program.visit_count}</b>{" "}
                {program.visit_count === 1 ? "gång" : "gånger"}, senast{" "}
                {new Date(program.last_visited_at as string).toLocaleString(
                  "sv-SE",
                  {
                    dateStyle: "short",
                    timeStyle: "short",
                  },
                )}
                .
              </>
            ) : (
              <span style={{ color: "var(--warm)" }}>
                Länken har inte öppnats än.
              </span>
            )}
          </p>

          {program.sent_to_email && (
            <p style={{ color: "var(--text-soft)", fontSize: "0.88rem" }}>
              Mejlad till <b>{program.sent_to_email}</b>
              {program.sent_at &&
                `, ${new Date(program.sent_at).toLocaleString("sv-SE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}`}
              .
            </p>
          )}
        </div>

        <h2 style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: 12 }}>
          Övningar
        </h2>
        <div className={styles.list} style={{ marginBottom: 28 }}>
          {(rows ?? []).map((r, i) => {
            const ex = r.exercises as unknown as { title: string } | null;
            return (
              <div key={i} className={styles.row} style={{ cursor: "default" }}>
                <div className={styles.rowInfo}>
                  <div className={styles.name}>
                    {ex?.title ?? "Okänd övning"}
                  </div>
                  <div className={styles.preview}>{r.notes || "—"}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href={`/coaching/kundprogram/${program.id}/redigera`}
            className="btn btn-primary"
          >
            Redigera program
          </Link>
          <Link
            href="/coaching/kundprogram/ny"
            className="btn btn-ghost"
            style={{ border: "1px solid var(--line)" }}
          >
            + Nytt kundprogram
          </Link>
          <form action={deleteClinicProgram.bind(null, program.id)}>
            <button
              type="submit"
              className="btn btn-ghost"
              style={{ border: "1px solid var(--line)" }}
            >
              Ta bort
            </button>
          </form>
        </div>

        <Footer />
      </div>
    </>
  );
}
