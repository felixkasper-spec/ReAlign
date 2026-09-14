import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { createCheckoutSession } from "@/app/min-sida/actions";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "./page.module.css";

export const metadata = {
  ...pageMetadata({
    title: "Bli Premium Coaching-kund — ReAlign Metoden",
    description: "Slutför din prenumeration på Premium Coaching.",
    image: "/og/premium-coaching.png",
    path: "/bli-kund",
  }),
  // Sidan är till för att delas personligen efter ett samtal, inte för att
  // hittas organiskt — den saknar helt kontext för någon som landar här
  // utan att redan veta vad Premium Coaching är.
  robots: { index: false, follow: false },
};

export default async function BliKundPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const subscription = user ? await getSubscription() : null;

  const alreadyCoaching =
    subscription?.active && subscription.plan === "premium_coaching";
  const isBasePremium =
    subscription?.active && subscription.plan !== "premium_coaching";

  return (
    <div className={styles.page}>
      <header className={styles.minimalHeader}>
        <Link href="/" className={styles.logo}>
          <span className={styles.mark} />
          ReAlign
        </Link>
      </header>

      <div className={styles.wrap}>
        <div className={styles.card}>
          <span className="eyebrow">Premium Coaching</span>
          <h1>449 kr/mån</h1>

          {alreadyCoaching ? (
            <>
              <p>Din prenumeration är redan aktiv.</p>
              <Link
                className="btn btn-primary btn-lg"
                href="/min-sida/coaching"
              >
                Till chatten →
              </Link>
            </>
          ) : isBasePremium ? (
            <>
              <p>
                Du har redan Premium — uppgradera direkt, ingen ny
                betalinformation behövs.
              </p>
              <Link
                className="btn btn-primary btn-lg"
                href="/min-sida/byt-plan?to=premium_coaching"
              >
                Uppgradera till Premium Coaching →
              </Link>
            </>
          ) : user ? (
            <>
              <p>Betalning sker säkert via Stripe.</p>
              <form
                action={createCheckoutSession.bind(
                  null,
                  "premium_coaching",
                  "month",
                )}
              >
                <SubmitButton
                  className="btn btn-primary btn-lg"
                  pendingText="Öppnar Stripe..."
                >
                  Fortsätt till betalning →
                </SubmitButton>
              </form>
            </>
          ) : (
            <>
              <p>Skapa ett konto för att slutföra din prenumeration.</p>
              <Link
                className="btn btn-primary btn-lg"
                href="/signup?next=/bli-kund"
              >
                Skapa konto →
              </Link>
              <p className={styles.loginNote}>
                Har du redan ett konto?{" "}
                <Link href="/login?next=/bli-kund">Logga in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
