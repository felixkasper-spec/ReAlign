import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubmitButton from "@/components/SubmitButton";
import FaqAccordion, { type FaqGroup } from "@/components/FaqAccordion";
import { testimonials } from "@/lib/testimonials";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { createCheckoutSession } from "@/app/min-sida/actions";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Premium — ReAlign Metoden",
  description:
    "Alla nivåer, alla program, hela vägen — 149 kr/mån, första månaden till halva priset. Ingen bindningstid.",
  image: "/og/premium.png",
  path: "/premium",
});

const faqGroups: FaqGroup[] = [
  {
    eyebrow: "Innan du bestämmer dig",
    items: [
      {
        q: "Hur fungerar 50%-rabatten?",
        a: "Din första månad kostar automatiskt halva priset, 74,50 kr — ingen kod behövs, det dras direkt vid kassan. Från månad två gäller ordinarie pris, 149 kr/mån. Gäller vid månadsvis betalning.",
      },
      {
        q: "Kan jag betala årsvis istället?",
        a: "Ja — 1 341 kr/år, vilket motsvarar 25% rabatt jämfört med att betala månadsvis (149 kr/mån × 12 = 1 788 kr). Priset är detsamma varje år, ingen ny rabatt att hålla koll på. Årsvis kombineras inte med 50%-rabatten på första månaden, eftersom rabatten redan är inbakad i årspriset.",
      },
      {
        q: "Är jag bunden till något?",
        a: "Nej. Ingen bindningstid — avsluta med ett klick i Min sida när du vill, prenumerationen fortsätter bara till slutet av den redan betalda månaden.",
      },
      {
        q: "Behöver jag någon utrustning?",
        a: "Nej, de flesta övningarna kräver ingen utrustning alls. Vissa använder en stol, en vägg eller en kudde. Ett fåtal mer avancerade övningar (Postural Gymträning) är byggda för gymredskap, men det framgår tydligt på varje program.",
      },
      {
        q: "Jag tränar redan annat — passar det ändå?",
        a: "Ja, absolut. Postural träning kompletterar annan träning bra eftersom den bygger upp de djupa musklerna som stabiliserar kroppen, vilket ofta förbättrar prestationen i annan träning också.",
      },
      {
        q: "Kan jag uppgradera till Premium Coaching senare?",
        a: "Ja, när som helst från Min sida — ingen ny registrering, du byter bara nivå och betalar mellanskillnaden.",
      },
      {
        q: "Går det att betala med friskvårdsbidrag?",
        a: "Ja, Premium går att betala med friskvårdsbidrag.",
      },
    ],
  },
];

export default async function PremiumPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const subscription = user ? await getSubscription() : null;
  const alreadyPremium = subscription?.active;

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Premium</span>
          <h1>Alla nivåer. Alla program. Hela vägen.</h1>
          <p>
            Gratis kontot ger dig grunderna — Premium låser upp resten:
            varenda nivå, i varenda kategori, plus Postural Gymträning,
            progressionsspårning och verktygen för att faktiskt hålla i
            det.
          </p>
        </header>

        <div className={styles.offerBand}>
          <div>
            <span className={styles.offerEyebrow}>Introerbjudande</span>
            <p className={styles.offerTitle}>50% första månaden</p>
            <p className={styles.offerText}>
              74,50 kr första månaden, sen 149 kr/mån. Ingen kod, ingen
              bindningstid — dras automatiskt vid kassan. Vill du hellre
              betala årsvis och spara 25% direkt? Se prisalternativen
              nedan.
            </p>
          </div>
          {!alreadyPremium && (
            <>
              {user ? (
                <form action={createCheckoutSession.bind(null, "premium", "month")}>
                  <SubmitButton className="btn btn-primary btn-lg" pendingText="Öppnar Stripe...">
                    Bli Premium →
                  </SubmitButton>
                </form>
              ) : (
                <Link className="btn btn-primary btn-lg" href="/signup">
                  Skapa konto →
                </Link>
              )}
            </>
          )}
        </div>

        <div className={styles.section} style={{ borderTop: "none", paddingTop: 0 }}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Vad ingår</span>
            <h2>Från grunderna till full progression.</h2>
          </div>
          <div className={styles.reasonGrid}>
            <div className={styles.reason}>
              <b>Alla programnivåer</b>Tillgång till alla nivåer i alla
              kategorier.
            </div>
            <div className={styles.reason}>
              <b>Progressionsspårning</b>Se svart på vitt hur du utvecklas
              vecka för vecka.
            </div>
            <div className={styles.reason}>
              <b>Postural Gymträning</b>Tre gymbaserade program för dig som
              vill ta träningen vidare med redskap.
            </div>
            <div className={styles.reason}>
              <b>Bygg eget program</b>Spara favoritövningar och kombinera dem
              till ett eget, namngivet program i din egen ordning.
            </div>
            <div className={styles.reason}>
              <b>Övningsbanken</b>Bläddra och sök bland alla övningar, med
              video och fulla instruktioner för varje.
            </div>
            <div className={styles.reason}>
              <b>Ladda ner program som PDF</b>Ta med programmet till gymmet
              eller skriv ut det — bild och instruktion för varje övning.
            </div>
            <div className={styles.reason}>
              <b>Veckobrev</b>Tips och uppföljning direkt i mejlen, så du
              håller farten uppe.
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Cleer+Klinik+Hulda+Lindgrens+gata+8+G%C3%B6teborg"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.googleRating}
          >
            <span className={styles.stars}>★★★★★</span>
            <span>
              <b>5.0</b> på Google (53 recensioner)
            </span>
          </a>
          <p className={styles.googleRatingNote}>
            Recensioner från vår fysiska klinik - Cleer Klinik.
          </p>
          <div className={styles.quoteGrid}>
            {testimonials.slice(0, 2).map((t) => (
              <div key={t.quote} className={styles.quoteCard}>
                <p>&quot;{t.quote}&quot;</p>
                <p>— {t.name}, Google-recension</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.trustBox}>
            <div className={styles.checkItem}>
              <span className={styles.checkIc}>✓</span>
              Ingen bindningstid — avsluta när du vill
            </div>
            <div className={styles.checkItem}>
              <span className={styles.checkIc}>✓</span>
              Avsluta med ett klick i Min sida, ingen mejlkontakt krävs
            </div>
            <div className={styles.checkItem}>
              <span className={styles.checkIc}>✓</span>
              Går att betala med friskvårdsbidrag
            </div>
            <div className={styles.checkItem}>
              <span className={styles.checkIc}>✓</span>
              Byt till Premium Coaching när som helst, ingen ny registrering
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Vanliga frågor</span>
            <h2>Innan du bestämmer dig.</h2>
          </div>
          <FaqAccordion groups={faqGroups} />
        </div>

        <div className={styles.ctaBand}>
          <span className="eyebrow" style={{ color: "var(--warm-soft)" }}>
            {alreadyPremium ? "Du är redan medlem" : "Premium"}
          </span>
          {!user || alreadyPremium ? <h2>149 kr/mån</h2> : <h2>Välj hur du vill betala</h2>}

          {alreadyPremium ? (
            <>
              <p>Din prenumeration är aktiv — hantera den på Min sida.</p>
              <Link className="btn btn-primary btn-lg" href="/min-sida">
                Till Min sida →
              </Link>
            </>
          ) : user ? (
            <div className={styles.planToggle}>
              <div className={styles.planOption}>
                <span className={styles.planLabel}>Månadsvis</span>
                <p className={styles.planPrice}>149 kr/mån</p>
                <p className={styles.planSub}>
                  Första månaden 74,50 kr — ingen bindningstid.
                </p>
                <form action={createCheckoutSession.bind(null, "premium", "month")}>
                  <SubmitButton className="btn btn-primary" pendingText="Öppnar Stripe...">
                    Bli Premium →
                  </SubmitButton>
                </form>
              </div>
              <div className={styles.planOption}>
                <span className={styles.planLabel}>
                  Årsvis <span className={styles.planBadge}>Spara 25%</span>
                </span>
                <p className={styles.planPrice}>1 341 kr/år</p>
                <p className={styles.planSub}>
                  Motsvarar 111,75 kr/mån, betalas en gång per år.
                </p>
                <form action={createCheckoutSession.bind(null, "premium", "year")}>
                  <SubmitButton className="btn btn-primary" pendingText="Öppnar Stripe...">
                    Betala årsvis →
                  </SubmitButton>
                </form>
              </div>
            </div>
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
