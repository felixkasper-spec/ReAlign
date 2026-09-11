import Image from "next/image";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import LeadForm from "./LeadForm";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Intresseanmälan Premium Coaching — ReAlign Metoden",
  description:
    "Lämna dina uppgifter så ringer jag dig personligen och berättar mer om Premium Coaching.",
  image: "/og/premium-coaching.png",
  path: "/coaching-anmalan",
});

export default function CoachingAnmalanPage() {
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
          <span className="eyebrow">Premium Coaching</span>
          <h1>
            En egen coach som hjälper dig bli av med spänningen — inte bara ett
            program.
          </h1>
          <p className={styles.heroLead}>
            Direktkontakt med mig, för allt du annars skulle behöva gissa dig
            till: teknik, val av övningar, vad som händer när något gör ont.
          </p>

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

        <div className={styles.grid}>
          <div className={styles.side}>
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
                  Postural Terapeut · 5 år · 1 500+ hjälpta patienter
                </div>
              </div>
            </div>

            <ul className={styles.bullets}>
              <li>Direktkontakt via chatt, svar inom 1–2 vardagar</li>
              <li>Hjälp att justera ditt program utifrån hur kroppen känns</li>
              <li>Begränsat antal platser för att kunna hålla kvaliteten</li>
            </ul>
          </div>

          <LeadForm />
        </div>
      </div>

      <footer className={styles.minimalFooter}>
        © 2026 Felix Kasper AB ·{" "}
        <Link href="/integritetspolicy">Integritetspolicy</Link>
      </footer>
    </div>
  );
}
