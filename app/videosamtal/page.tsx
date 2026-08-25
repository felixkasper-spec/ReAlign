import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "./page.module.css";

const BOKADIREKT_URL =
  "https://www.bokadirekt.se/boka-tjanst/realign-metoden-136305/postural-traning-analys-och-skraddarsytt-program-3504740";

export const metadata = pageMetadata({
  title: "Videosamtals-analys — ReAlign Metoden",
  description:
    "Ett videosamtal med en av våra terapeuter, följt av ett program skräddarsytt exakt utifrån din kropp. 590 kr, engångsköp.",
  image: "/og/videosamtal.png",
});

export default function VideosamtalPage() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Videosamtals-analys</span>
          <h1>En personlig bedömning — och ett program byggt just för dig.</h1>
          <p>
            Inget generellt program. Vi ser hur just din kropp rör sig och
            bygger sedan ett träningsprogram skräddarsytt utifrån det, inte
            utifrån en mall.
          </p>
        </header>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Så går det till</span>
            <h2>Tre steg, ett videosamtal.</h2>
          </div>
          <div className={styles.stepGrid}>
            <div className={styles.step}>
              <span className={styles.stepNum}>1</span>
              <b>Boka en tid</b>
              Välj en tid som passar via Bokadirekt — samtalet sker digitalt,
              du behöver bara en kamera.
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>2</span>
              <b>Videosamtal med en terapeut</b>
              Vi går igenom din kropp och hållning tillsammans, pratar om var
              det gör ont och hur din vardag ser ut.
            </div>
            <div className={styles.step}>
              <span className={styles.stepNum}>3</span>
              <b>Få ditt skräddarsydda program</b>
              Du får ett träningsprogram byggt utifrån exakt det vi ser hos
              dig — inget generiskt.
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
              <span className={styles.coachEyebrow}>Vem du möter</span>
              <h3 className={styles.coachName}>Felix Eliasson</h3>
              <p className={styles.coachText}>
                Utbildad Postural Terapeut via Optimum-Metoden, med fem års
                erfarenhet och över 1 500 hjälpta patienter. Det är jag som
                håller i samtalet.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.ctaBand}>
          <span className="eyebrow" style={{ color: "var(--warm-soft)" }}>
            Videosamtals-analys
          </span>
          <h2>590 kr</h2>
          <p>Engångsköp — oavsett om du redan har Premium eller inte.</p>
          <a
            className="btn btn-primary btn-lg"
            href={BOKADIREKT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Boka videosamtal →
          </a>
          <p className={styles.ctaNote}>✓ Går att betala med friskvårdsbidrag</p>
        </div>

        <p className={styles.altNote}>
          Letar du efter löpande stöd istället för en engångsanalys? Se{" "}
          <Link href="/premium-coaching">Premium Coaching</Link> — chatt med
          en coach för 449 kr/mån.
        </p>

        <Footer />
      </div>
    </>
  );
}
