import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { pageMetadata } from "@/lib/page-metadata";
import IntakeForm from "./IntakeForm";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Kom igång-formulär — ReAlign Metoden",
  description: "Berätta om dig själv så vi kan skräddarsy ditt program.",
  path: "/f",
});

// Formulärsvaren ändras (kunden kan komma tillbaka och uppdatera), så det
// får aldrig cachas statiskt.
export const dynamic = "force-dynamic";

export default async function IntakeFormPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();

  const { data: intake } = await admin
    .from("customer_intake_forms")
    .select(
      "customer_name, height_cm, weight_kg, symptoms, pain_level, previous_injuries, medications, sedentary_work, sleep_habits, current_training, equipment_access, session_length, goals, other_info",
    )
    .eq("token", token)
    .maybeSingle();

  return (
    <div className={styles.page}>
      <header className={styles.minimalHeader}>
        <Link href="/" className={styles.logo}>
          <Image src="/logo.png" alt="ReAlign Metoden" width={55} height={35} />
        </Link>
      </header>

      <div className={styles.wrap}>
        <div className={styles.hero}>
          <span className="eyebrow">Kom igång</span>
          <h1>Berätta om dig själv</h1>
          <p className={styles.heroLead}>
            Ju mer vi vet, desto bättre kan vi skräddarsy din behandling/dina
            övningar.
          </p>
        </div>

        {intake ? (
          <IntakeForm token={token} intake={intake} />
        ) : (
          <div className={styles.panel}>
            <p>Länken är ogiltig eller har gått ut — hör av dig till kliniken.</p>
          </div>
        )}
      </div>

      <footer className={styles.minimalFooter}>
        <Link href="/integritetspolicy">Integritetspolicy</Link>
      </footer>
    </div>
  );
}
