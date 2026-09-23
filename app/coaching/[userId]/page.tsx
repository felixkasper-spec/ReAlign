import Link from "next/link";
import { notFound } from "next/navigation";
import AttachmentMedia from "@/components/AttachmentMedia";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { linkify } from "@/lib/linkify";
import { COACHING_ATTACHMENT_BUCKET } from "@/lib/coaching-attachments";
import { replyToCoachingThread } from "../actions";
import DriveLinkButton from "./DriveLinkButton";
import ReplyForm from "./ReplyForm";
import ScrollToLatest from "./ScrollToLatest";
import styles from "../page.module.css";

export default async function CoachingThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  await requireCoach();
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("email, display_name, drive_folder_url")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  // Visar tydligt om den inloggade användaren är kopplad till en fysisk
  // klinikkund (se customers-tabellen och kopplingsverktyget på kundens
  // sida) samt om den har en aktiv Premium Coaching-prenumeration — chatten
  // är öppen för alla inloggade, så det är inte längre givet vem man
  // chattar med bara utifrån att tråden finns.
  const [{ data: linkedCustomer }, { data: subscription }] = await Promise.all([
    admin.from("customers").select("phone, name").eq("linked_user_id", userId).maybeSingle(),
    admin
      .from("subscriptions")
      .select("plan, status")
      .eq("user_id", userId)
      .in("status", ["active", "trialing"])
      .maybeSingle(),
  ]);
  const hasPremiumCoaching = subscription?.plan === "premium_coaching";

  const { data: messages } = await admin
    .from("coaching_messages")
    .select("id, sender, body, created_at, attachment_path, attachment_type")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  const messagesWithUrls = await Promise.all(
    (messages ?? []).map(async (m) => {
      if (!m.attachment_path) {
        return { ...m, attachment_url: null as string | null };
      }
      const { data } = await admin.storage
        .from(COACHING_ATTACHMENT_BUCKET)
        .createSignedUrl(m.attachment_path, 3600);
      return { ...m, attachment_url: data?.signedUrl ?? null };
    }),
  );

  await admin
    .from("coaching_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("sender", "user")
    .is("read_at", null);

  const reply = replyToCoachingThread.bind(null, userId);
  const displayName = profile.display_name || profile.email;

  return (
      <div className={`wrap ${styles.wrap}`}>
        <Link href="/coaching" className={styles.back}>
          ← Alla trådar
        </Link>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          <div>
            <span className="eyebrow">
              {hasPremiumCoaching ? "Premium Coaching" : "Meddelande"}
            </span>
            <h1>{displayName}</h1>
            {linkedCustomer && (
              <p style={{ fontSize: "0.88rem", marginTop: 4 }}>
                Kopplad kund:{" "}
                <Link href={`/coaching/kunder/${linkedCustomer.phone}`}>
                  {linkedCustomer.name || linkedCustomer.phone} →
                </Link>
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <DriveLinkButton userId={userId} initialUrl={profile.drive_folder_url} />
            <Link
              href={`/coaching/${userId}/journal`}
              className="btn btn-ghost"
              style={{ border: "1px solid var(--line)", flexShrink: 0 }}
            >
              🔒 Journal →
            </Link>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardScroll}>
            {messagesWithUrls.length === 0 && (
              <p className={styles.empty}>Inga meddelanden än.</p>
            )}
            {messagesWithUrls.map((m) => (
              <div
                key={m.id}
                className={`${styles.msg} ${
                  m.sender === "coach" ? styles.msgCoach : styles.msgUser
                }`}
              >
                <span className={styles.msgMeta}>
                  {m.sender === "coach" ? "Coach" : displayName} ·{" "}
                  {new Date(m.created_at as string).toLocaleString("sv-SE")}
                </span>
                {m.attachment_url && m.attachment_type && (
                  <AttachmentMedia
                    url={m.attachment_url}
                    type={m.attachment_type}
                  />
                )}
                {m.body && <p>{linkify(m.body)}</p>}
              </div>
            ))}
            <ScrollToLatest />
          </div>

          <div className={styles.cardComposer}>
            <ReplyForm
              userId={userId}
              reply={reply}
              aiEnabled={!!process.env.ANTHROPIC_API_KEY}
            />
          </div>
        </div>
      </div>
  );
}
