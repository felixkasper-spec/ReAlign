import { type EmailOtpType } from "@supabase/supabase-js";
import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import styles from "../../(auth)/auth.module.css";
import { confirmEmail } from "./actions";

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash, type } = await searchParams;

  // Ingen automatisk verifiering på sidladdning — mejlsäkerhetsskannrar
  // (t.ex. Microsoft Safe Links) besöker länkar i inkommande mejl
  // automatiskt, vilket annars skulle förbruka den engångsgiltiga
  // token:en innan mottagaren själv hunnit klicka. Verifieringen sker
  // först när användaren aktivt klickar knappen nedan.
  if (!token_hash || !type) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <span className="eyebrow">Bekräfta e-post</span>
          <h1>Länken är ogiltig</h1>
          <p>
            Länken saknar nödvändig information, eller har redan använts.
          </p>
          <Link className={`btn btn-primary ${styles.submit}`} href="/login">
            Till inloggning
          </Link>
        </div>
      </div>
    );
  }

  const confirmAction = confirmEmail.bind(null, token_hash, type as EmailOtpType);

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <span className="eyebrow">Nästan klart</span>
        <h1>Bekräfta din e-post</h1>
        <p>Klicka på knappen nedan för att aktivera ditt konto.</p>
        <form action={confirmAction}>
          <SubmitButton
            className={`btn btn-primary ${styles.submit}`}
            pendingText="Bekräftar..."
          >
            Bekräfta e-post →
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
