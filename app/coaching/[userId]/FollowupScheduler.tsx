import { scheduleFollowup, completeFollowup } from "../actions";
import styles from "../page.module.css";

export type FollowupRow = {
  id: string;
  note: string | null;
  remind_at: string;
};

// Ad-hoc uppföljningspåminnelse — coachen väljer själv hur många dagar fram
// (t.ex. efter att ha svarat en kund) och en valfri anteckning om vad som
// ska följas upp. Rena formulär mot server actions räcker (ingen AI-knapp
// eller liveValidering som ReplyForm behöver), så ingen "use client" krävs.
export default function FollowupScheduler({
  userId,
  active,
}: {
  userId: string;
  active: FollowupRow[];
}) {
  const schedule = scheduleFollowup.bind(null, userId);

  return (
    <div className={styles.card} style={{ padding: "16px 18px", marginTop: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 10 }}>Schemalägg påminnelse</div>

      {active.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
          {active.map((f) => (
            <div
              key={f.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                fontSize: "0.85rem",
                border: "1px solid var(--line)",
                borderRadius: 10,
                padding: "8px 12px",
              }}
            >
              <span>
                {new Date(f.remind_at).toLocaleDateString("sv-SE", {
                  dateStyle: "medium",
                })}
                {f.note ? ` — ${f.note}` : ""}
              </span>
              <form action={completeFollowup.bind(null, f.id, userId)}>
                <button type="submit" className="btn btn-ghost" style={{ border: "1px solid var(--line)", flexShrink: 0 }}>
                  Klar
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <form action={schedule} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
        <label style={{ fontSize: "0.82rem" }}>
          Om hur många dagar?
          <br />
          <input
            type="number"
            name="days"
            min={1}
            defaultValue={7}
            required
            style={{
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "6px 10px",
              width: 70,
              fontFamily: "inherit",
            }}
          />
        </label>
        <label style={{ fontSize: "0.82rem", flex: 1, minWidth: 180 }}>
          Anteckning (valfritt)
          <br />
          <input
            type="text"
            name="note"
            placeholder="Vad ska följas upp?"
            style={{
              border: "1px solid var(--line)",
              borderRadius: 8,
              padding: "6px 10px",
              width: "100%",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </label>
        <button type="submit" className="btn btn-primary">
          Schemalägg →
        </button>
      </form>
    </div>
  );
}
