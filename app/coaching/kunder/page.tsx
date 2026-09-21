import type { Metadata } from "next";
import Link from "next/link";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/customer-identity";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Kunder — ReAlign Metoden" };

type CustomerRow = {
  phone: string;
  name: string;
  email: string | null;
  visitCount: number;
  lastVisit: string;
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireCoach();
  const { q } = await searchParams;
  const admin = createAdminClient();

  const { data: bookings } = await admin
    .from("bookings")
    .select("customer_name, customer_phone, customer_email, start_at")
    .order("start_at", { ascending: false });

  const byPhone = new Map<string, CustomerRow>();
  for (const b of bookings ?? []) {
    const phone = normalizePhone(b.customer_phone);
    if (!phone) continue;
    const existing = byPhone.get(phone);
    if (existing) {
      existing.visitCount += 1;
      // Bokningarna är sorterade nyast först, så den första träffen per
      // telefonnummer har redan det senaste namnet/mejlet — skriv inte över.
    } else {
      byPhone.set(phone, {
        phone,
        name: b.customer_name,
        email: b.customer_email,
        visitCount: 1,
        lastVisit: b.start_at,
      });
    }
  }

  const customers = [...byPhone.values()].sort((a, b) =>
    b.lastVisit.localeCompare(a.lastVisit),
  );

  const filtered = q?.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q.trim().toLowerCase()) ||
          c.phone.includes(q.trim().replace(/\D/g, "")),
      )
    : customers;

  return (
    <div className={`wrap ${styles.wrap}`}>
      <h1>Kundlista</h1>
      <p style={{ color: "var(--text-soft)", fontSize: "0.88rem", marginBottom: 20 }}>
        Alla kunder som bokat en tid, med bokningshistorik, journal och
        kom igång-formulär samlat per kund.
      </p>

      {customers.length > 0 && (
        <form
          action="/coaching/kunder"
          method="get"
          style={{ display: "flex", gap: 8, marginBottom: 16 }}
        >
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Sök på namn eller telefonnummer..."
            style={{
              flex: 1,
              border: "1px solid var(--line)",
              borderRadius: 100,
              padding: "8px 16px",
              fontSize: "0.88rem",
              fontFamily: "inherit",
            }}
          />
          <button
            type="submit"
            className="btn btn-ghost"
            style={{ border: "1px solid var(--line)" }}
          >
            Sök
          </button>
        </form>
      )}

      {customers.length === 0 && (
        <p className={styles.empty}>Inga kunder har bokat en tid än.</p>
      )}

      {customers.length > 0 && filtered.length === 0 && (
        <p className={styles.empty}>Ingen kund matchade &quot;{q}&quot;.</p>
      )}

        <div className={styles.list}>
          {filtered.map((c) => (
            <Link key={c.phone} href={`/coaching/kunder/${c.phone}`} className={styles.row}>
              <div className={styles.rowInfo}>
                <div className={styles.name}>{c.name}</div>
                <div className={styles.preview}>
                  {c.phone}
                  {c.email ? ` · ${c.email}` : ""} · {c.visitCount}{" "}
                  {c.visitCount === 1 ? "besök" : "besök"}
                </div>
              </div>
            </Link>
          ))}
        </div>
    </div>
  );
}
