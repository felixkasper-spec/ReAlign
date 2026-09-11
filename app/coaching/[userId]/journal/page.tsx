import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AttachmentMedia from "@/components/AttachmentMedia";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { COACHING_JOURNAL_BUCKET } from "@/lib/coaching-journal";
import { deleteJournalEntry } from "./actions";
import JournalComposer from "./JournalComposer";
import styles from "../../page.module.css";

export const metadata: Metadata = { title: "Journal — ReAlign Metoden" };

export default async function CoachingJournalPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  await requireCoach();
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("email, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const { data: entries } = await admin
    .from("coaching_journal_entries")
    .select("id, body, attachment_path, attachment_type, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const entriesWithUrls = await Promise.all(
    (entries ?? []).map(async (e) => {
      if (!e.attachment_path) {
        return { ...e, attachment_url: null as string | null };
      }
      const { data } = await admin.storage
        .from(COACHING_JOURNAL_BUCKET)
        .createSignedUrl(e.attachment_path, 3600);
      return { ...e, attachment_url: data?.signedUrl ?? null };
    }),
  );

  const displayName = profile.display_name || profile.email;

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <Link href={`/coaching/${userId}`} className={styles.back}>
          ← Till chatten
        </Link>
        <span className="eyebrow">🔒 Privat journal</span>
        <h1>{displayName}</h1>
        <p
          style={{
            color: "var(--text-soft)",
            fontSize: "0.88rem",
            marginBottom: 24,
          }}
        >
          Endast synligt för dig — kunden ser aldrig de här anteckningarna.
        </p>

        <JournalComposer userId={userId} />

        <div className={styles.thread} style={{ marginTop: 24 }}>
          {entriesWithUrls.length === 0 && (
            <p className={styles.empty}>Inga anteckningar än.</p>
          )}
          {entriesWithUrls.map((e) => (
            <div key={e.id} className={styles.journalEntry}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <span className={styles.msgMeta}>
                  {new Date(e.created_at as string).toLocaleString("sv-SE")}
                </span>
                <form action={deleteJournalEntry.bind(null, userId, e.id)}>
                  <button
                    type="submit"
                    className={styles.journalDeleteBtn}
                    aria-label="Ta bort anteckning"
                  >
                    ✕
                  </button>
                </form>
              </div>
              {e.attachment_url && e.attachment_type && (
                <AttachmentMedia
                  url={e.attachment_url}
                  type={e.attachment_type}
                />
              )}
              {e.body && <p>{e.body}</p>}
            </div>
          ))}
        </div>

        <Footer />
      </div>
    </>
  );
}
