import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubmitButton from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { createCheckoutSession } from "@/app/min-sida/actions";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Premium Coaching — ReAlign Metoden",
  description:
    "Allt i Premium, plus direktkontakt med en coach via chatt. 449 kr/mån, begränsat antal platser.",
};

export default async function PremiumCoachingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const subscription = user ? await getSubscription() : null;

  const alreadyCoaching =
    subscription?.active && subscription.plan === "premium_coaching";
  const isBasePremium = subscription?.active && subscription.plan !== "premium_coaching";

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Premium Coaching</span>
          <h1>Direktkontakt med en coach, när du behöver den.</h1>
          <p>
            Allt som ingår i Premium — plus en riktig coach på kliniken som
            svarar på dina frågor om övningar, upplägg och hur kroppen känns,
            via chatt direkt i Min sida.
          </p>
        </header>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Vad ingår</span>
            <h2>Samma som Premium — plus en coach i fickan.</h2>
          </div>
          <div className={styles.reasonGrid}>
            <div className={styles.reason}>
              <b>Allt i Premium</b>Alla programnivåer, Gymträning, alla
              övningsvideor, PDF-nedladdning, progressionsspårning och
              veckobrev.
            </div>
            <div className={styles.reason}>
              <b>Direktkontakt via chatt</b>Fråga om en övning känns fel,
              be om ett anpassat upplägg, fråga om dina besvär, skicka video
              på din teknik och få feedback, checka in när du kört fast,
              eller få tips om egenbehandling — och allt annat du kommer på.
            </div>
            <div className={styles.reason}>
              <b>Svar inom 1–2 vardagar</b>En riktig person på kliniken
              läser och svarar på dina meddelanden — inte en bot.
            </div>
            <div className={styles.reason}>
              <b>Begränsat antal platser</b>Vi tar in ett begränsat antal
              Premium Coaching-medlemmar åt gången för att kunna hålla
              svarstiderna.
            </div>
          </div>
        </div>

        <div className={styles.section} style={{ borderTop: "none", paddingTop: 0 }}>
          <div className={styles.coachBox}>
            <div className={styles.coachPhoto}>
              <Image
                src="/om-oss/felix.jpg"
                alt="Felix Eliasson"
                fill
                sizes="120px"
              />
            </div>
            <div>
              <span className={styles.coachEyebrow}>Din coach</span>
              <h3 className={styles.coachName}>Felix Eliasson</h3>
              <p className={styles.coachText}>
                Utbildad Postural Terapeut via Optimum-Metoden, med fem års
                erfarenhet och över 1 500 hjälpta patienter. Det är jag som
                läser och svarar på dina meddelanden.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.ctaBand}>
          <span className="eyebrow" style={{ color: "var(--warm-soft)" }}>
            {alreadyCoaching ? "Du är redan medlem" : "Premium Coaching"}
          </span>
          <h2>449 kr/mån</h2>

          {alreadyCoaching ? (
            <>
              <p>Din prenumeration är aktiv — chatta med din coach på Min sida.</p>
              <Link className="btn btn-primary btn-lg" href="/min-sida/coaching">
                Till chatten →
              </Link>
            </>
          ) : isBasePremium ? (
            <>
              <p>
                Du har redan Premium — uppgradera direkt, ingen ny
                registrering behövs.
              </p>
              <Link className="btn btn-primary btn-lg" href="/min-sida/byt-plan?to=premium_coaching">
                Uppgradera till Premium Coaching →
              </Link>
            </>
          ) : user ? (
            <>
              <p>Kom igång direkt — betalning sker säkert via Stripe.</p>
              <form action={createCheckoutSession.bind(null, "premium_coaching")}>
                <SubmitButton className="btn btn-primary btn-lg" pendingText="Öppnar Stripe...">
                  Bli Premium Coaching →
                </SubmitButton>
              </form>
            </>
          ) : (
            <>
              <p>Skapa ett konto för att komma igång.</p>
              <Link className="btn btn-primary btn-lg" href="/signup">
                Skapa konto →
              </Link>
            </>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
