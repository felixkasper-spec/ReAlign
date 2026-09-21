import type { Metadata } from "next";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { type PackageRow } from "./PackageTable";
import UpplaggBoard from "./UpplaggBoard";

export const metadata: Metadata = { title: "Upplägg — ReAlign Metoden" };

export default async function PackagesPage() {
  await requireCoach();
  const admin = createAdminClient();

  const { data } = await admin
    .from("client_packages")
    .select("id, customer_name, sessions_used, sessions_purchased, note_1, note_2, status")
    .order("sort_order")
    .order("created_at", { ascending: false });

  const packages = (data ?? []) as PackageRow[];

  return (
    <div className="wrap" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <h1>Upplägg</h1>
      <p style={{ color: "var(--text-soft)", fontSize: "0.88rem", marginBottom: 20 }}>
        Håll koll på pågående och avslutade träningsupplägg — namn, antal
        sessioner och egna anteckningar. Klicka i en ruta för att redigera,
        den sparas när du klickar utanför.
      </p>

      <UpplaggBoard packages={packages} />
    </div>
  );
}
