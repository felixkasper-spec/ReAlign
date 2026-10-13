import type { Metadata } from "next";
import Link from "next/link";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhone } from "@/lib/customer-identity";
import AddCustomerForm from "./AddCustomerForm";
import styles from "../page.module.css";

export const metadata: Metadata = { title: "Kunder — ReAlign Metoden" };

type CustomerRow = {
  phone: string | null;
  name: string;
  email: string | null;
  visitCount: number;
  lastVisit: string;
};

// Nyckeln för en kundrad i kartan nedan — telefon om den finns, annars
// e-post (bara konton utan telefon, se migration 0077, saknar båda delarna
// aldrig samtidigt eftersom customers.email är unikt när den är satt).
function rowKey(phone: string | null, email: string | null): string {
  return phone ?? `email:${email}`;
}

// URL-slug till kundens detaljsida — /coaching/kunder/[phone] accepterar
// antingen ett telefonnummer eller en URL-encodead e-post när telefon
// saknas, se [phone]/page.tsx.
function rowHref(c: CustomerRow): string {
  return `/coaching/kunder/${c.phone ?? encodeURIComponent(c.email ?? "")}`;
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireCoach();
  const { q } = await searchParams;
  const admin = createAdminClient();

  const [{ data: bookings }, { data: standaloneCustomers }] = await Promise.all([
    admin
      .from("bookings")
      .select("customer_name, customer_phone, customer_email, start_at")
      .order("start_at", { ascending: false }),
    admin.from("customers").select("phone, name, email, created_at"),
  ]);

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

  // Kunder som lagts till direkt (kundsidan, "Skapa kund" i kalenderns
  // bokningsskapare, eller automatiskt vid kontoregistrering utan telefon
  // — se migration 0077) utan att ännu ha någon bokning — läggs bara till
  // om de inte redan finns via en bokning, annars vinner den friskare
  // bokningsdatan.
  for (const c of standaloneCustomers ?? []) {
    // c.phone kan vara null nu (konto-bara kund utan telefon ännu, se
    // migration 0077) — normalizePhone() är inte null-säker (antar alltid
    // en sträng), så ett direkt anrop med null kraschade hela sidan.
    const phone = c.phone ? normalizePhone(c.phone) : null;
    const key = rowKey(phone, c.email);
    if (phone && byPhone.has(key)) continue;
    if (!phone && !c.email) continue;
    byPhone.set(key, {
      phone,
      name: c.name || phone || c.email || "Okänd",
      email: c.email,
      visitCount: 0,
      lastVisit: c.created_at,
    });
  }

  const customers = [...byPhone.values()].sort((a, b) =>
    b.lastVisit.localeCompare(a.lastVisit),
  );

  const filtered = q?.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q.trim().toLowerCase()) ||
          c.email?.toLowerCase().includes(q.trim().toLowerCase()) ||
          (c.phone && c.phone.includes(q.trim().replace(/\D/g, ""))),
      )
    : customers;

  return (
    <div className={`wrap ${styles.wrap}`}>
      <h1>Kundlista</h1>
      <p style={{ color: "var(--text-soft)", fontSize: "0.88rem", marginBottom: 20 }}>
        Alla kunder, med bokningshistorik, journal och kom igång-formulär
        samlat per kund.
      </p>

      <AddCustomerForm />

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
        <p className={styles.empty}>Inga kunder tillagda än.</p>
      )}

      {customers.length > 0 && filtered.length === 0 && (
        <p className={styles.empty}>Ingen kund matchade &quot;{q}&quot;.</p>
      )}

        <div className={styles.list}>
          {filtered.map((c) => (
            <Link key={rowKey(c.phone, c.email)} href={rowHref(c)} className={styles.row}>
              <div className={styles.rowInfo}>
                <div className={styles.name}>{c.name}</div>
                <div className={styles.preview}>
                  {c.phone ?? "Inget telefonnummer"}
                  {c.email ? ` · ${c.email}` : ""} ·{" "}
                  {c.visitCount === 0 ? "Ingen bokning än" : `${c.visitCount} besök`}
                </div>
              </div>
            </Link>
          ))}
        </div>
    </div>
  );
}
