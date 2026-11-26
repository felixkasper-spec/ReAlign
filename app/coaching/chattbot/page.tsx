import type { Metadata } from "next";
import { requireClinicStaff } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllPages } from "@/lib/supabase-paginate";
import styles from "./chattbot.module.css";
import listStyles from "../page.module.css";

export const metadata: Metadata = { title: "Chattbot — ReAlign Metoden" };

type MessageRow = {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type Session = {
  sessionId: string;
  messages: MessageRow[];
  preview: string;
  lastAt: string;
};

export default async function ChattbotPage() {
  await requireClinicStaff();
  const admin = createAdminClient();

  const { data: rows, error } = await fetchAllPages<MessageRow>((from, to) =>
    admin
      .from("chat_messages")
      .select("id, session_id, role, content, created_at")
      .order("created_at", { ascending: true })
      .range(from, to),
  );

  if (error) {
    console.error("ChattbotPage — kunde inte hämta konversationer:", error);
  }

  // Grupperar de löpande raderna (en per meddelande) till en tråd per
  // session_id — raderna är redan sorterade äldst-först (se .order ovan),
  // så varje sessions messages-lista hamnar i rätt ordning utan att sorteras
  // igen här.
  const bySession = new Map<string, Session>();
  for (const row of rows ?? []) {
    const existing = bySession.get(row.session_id);
    if (existing) {
      existing.messages.push(row);
      existing.lastAt = row.created_at;
    } else {
      bySession.set(row.session_id, {
        sessionId: row.session_id,
        messages: [row],
        preview: row.content,
        lastAt: row.created_at,
      });
    }
  }

  const sessions = [...bySession.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));

  return (
    <div className={`wrap ${listStyles.wrap}`}>
      <h1>Chattbot</h1>
      <p style={{ color: "var(--text-soft)", fontSize: "0.88rem", marginBottom: 20 }}>
        Konversationer från den publika chattboten på hemsidan — bra för att se vad besökare
        faktiskt undrar över, oavsett om de blev ett lead eller inte.
      </p>

      {sessions.length === 0 && <p className={listStyles.empty}>Inga konversationer loggade än.</p>}

      <div className={styles.list}>
        {sessions.map((s) => (
          <details key={s.sessionId} className={styles.card}>
            <summary className={styles.summary}>
              <span className={styles.preview}>{s.preview}</span>
              <span className={styles.meta}>
                {s.messages.length} meddelanden ·{" "}
                {new Date(s.lastAt).toLocaleString("sv-SE", {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: "Europe/Stockholm",
                })}
              </span>
            </summary>
            <div className={styles.thread}>
              {s.messages.map((m) => (
                <div key={m.id} className={`${styles.bubble} ${m.role === "user" ? styles.user : styles.assistant}`}>
                  {m.content}
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
