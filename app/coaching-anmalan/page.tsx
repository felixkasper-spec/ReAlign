import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import VimeoEmbed from "@/components/VimeoEmbed";
import VimeoPoster from "@/components/VimeoPoster";
import { pageMetadata } from "@/lib/page-metadata";
import LeadForm from "./LeadForm";
import ScrollHint from "./ScrollHint";
import styles from "./page.module.css";

// Samma "vänstra" kundvideo som visas på förstasidan.
const TESTIMONIAL_VIDEO_URL =
  "https://player.vimeo.com/video/1219363318?h=4447441569&title=0&byline=0&portrait=0";

export const metadata = pageMetadata({
  title: "Intresseanmälan Premium Coaching — ReAlign Metoden",
  description:
    "Lämna dina uppgifter så ringer jag dig personligen och berättar mer om Premium Coaching.",
  image: "/og/premium-coaching.png",
  path: "/coaching-anmalan",
});

export default async function CoachingAnmalanPage({
  searchParams,
}: {
  searchParams: Promise<{
    fbclid?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  }>;
}) {
  const { fbclid, utm_source, utm_medium, utm_campaign } = await searchParams;

  return (
    <div className={styles.page}>
      <header className={styles.minimalHeader}>
        <Link href="/" className={styles.logo}>
          <span className={styles.mark} />
          ReAlign
        </Link>
      </header>

      <div className={styles.wrap}>
        <div className={styles.hero}>
          <div className={styles.heroByline}>
            <div className={styles.heroAvatar}>
              <Image
                src="/om-oss/felix.jpg"
                alt="Felix Eliasson"
                fill
                sizes="32px"
              />
            </div>
            Felix Eliasson
          </div>
          <span className="eyebrow">Premium Coaching</span>
          <h1>
            En Postural Terapeut i din ficka som hjälper dig uppnå dina mål.
          </h1>
          <p className={styles.heroSub}>
            Oavsett om det är att bli av med smärta, bli mer rörlig, starkare
            eller mer funktionell.
          </p>
          <p className={styles.heroLead}>
            Jag hjälper dig analysera dina obalanser och svagheter, skapar
            skräddarsydda program med Postural Träning i fokus, samt gymträning,
            konditionsträning &amp; livsstil.
          </p>

          <div className={styles.heroPills}>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Cleer+Klinik+Hulda+Lindgrens+gata+8+G%C3%B6teborg"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.rating}
            >
              <span className={styles.stars}>★★★★★</span>
              <span>
                <b>5.0</b> på Google (53 recensioner)
              </span>
            </a>
          </div>

          <div className={styles.heroCtaRow}>
            <a
              href="#lead-form"
              className={`btn btn-primary btn-lg ${styles.heroCta}`}
            >
              Anmäl intresse →
            </a>
          </div>
        </div>

        <div id="steps" className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepNum}>1</span>
            Du lämnar dina uppgifter
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>2</span>
            Jag ringer dig — oftast samma dag
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>3</span>
            Vi pratar om din situation, helt utan förpliktelser
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.infoCard}>
            <div className={styles.coachBox}>
              <div className={styles.coachPhoto}>
                <Image
                  src="/om-oss/felix.jpg"
                  alt="Felix Eliasson"
                  fill
                  sizes="72px"
                />
              </div>
              <div>
                <div className={styles.coachName}>Felix Eliasson</div>
                <div className={styles.coachSub}>
                  Postural Terapeut, PT &amp; Samtalscoach · 1 500+ hjälpta
                  patienter
                </div>
              </div>
            </div>

            <ul className={styles.bullets}>
              <li>Skräddarsydda träningsprogram</li>
              <li>
                Obegränsad uppföljning — allt justeras efter dina
                förutsättningar: tid, ork, kroppens status, tillgång till
                utrustning/kroppsvikt med mera
              </li>
              <li>Bild- och videofeedback på teknik, funktion och hållning</li>
              <li>Direktkontakt via chatt, svar inom 1–2 vardagar</li>
              <li>Ingen bindningstid — avsluta när du vill</li>
              <li>Begränsat antal platser för att kunna hålla kvaliteten</li>
            </ul>

            <div className={styles.priceLine}>
              <span className={styles.priceLineLabel}>
                Allt det här ingår för
              </span>
              <span className={styles.priceLineAmount}>449 kr/mån</span>
            </div>
          </div>

          <div className={styles.testimonialSection}>
            <div className={styles.testimonialBox}>
              <span className={styles.testimonialLabel}>
                Hör en kund berätta
              </span>
              <Suspense
                fallback={
                  <VimeoEmbed
                    src={TESTIMONIAL_VIDEO_URL}
                    className={styles.testimonialVideo}
                    lazy
                  />
                }
              >
                <VimeoPoster
                  src={TESTIMONIAL_VIDEO_URL}
                  className={styles.testimonialVideo}
                  lazy
                />
              </Suspense>
            </div>
          </div>

          <LeadForm
            fbclid={fbclid}
            utmSource={utm_source}
            utmMedium={utm_medium}
            utmCampaign={utm_campaign}
          />
        </div>
      </div>

      <footer className={styles.minimalFooter}>
        © 2026 Felix Kasper AB ·{" "}
        <Link href="/integritetspolicy">Integritetspolicy</Link>
      </footer>

      <ScrollHint />
    </div>
  );
}
