import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Om oss — Cleer Klinik",
  description:
    "Cleer Klinik erbjuder postural träning som återställer kroppens naturliga balans. Möt kliniken bakom metoden.",
};

export default function OmOssPage() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header style={{ padding: "40px 0 30px" }}>
          <span className="eyebrow">Om oss</span>
          <h1 style={{ fontSize: "2.6rem", marginTop: 12 }}>Cleer Klinik.</h1>
          <p style={{ color: "var(--text-soft)", marginTop: 16, fontSize: "1.02rem", maxWidth: 600 }}>
            Cleer Klinik grundades för att hjälpa människor komma åt
            grundorsaken till sin smärta och stelhet — inte bara lindra
            symptomen. Vi arbetar med postural träning, en metod som ser
            kroppen som en helhet.
          </p>
        </header>

        <section className={styles.section} style={{ borderTop: "none" }}>
          <h2>Varför Cleer finns</h2>
          <p>
            Under min tid som elitfotbollsspelare hade jag alltid tillgång
            till duktiga fysioterapeuter, tränare och läkare — ändå skadade
            jag mig gång på gång, och kroppen kändes konstant svag och tung.
            Det väckte ett intresse för att förstå vad som faktiskt bygger
            allmän hälsa och funktion i kroppen, snarare än att bara
            behandla symptom.
          </p>
          <p style={{ marginTop: 16 }}>
            Vändpunkten kom när jag stötte på Postural Träning. Äntligen
            kändes kroppen bra igen, och skadorna uteblev. Det öppnade upp
            för ett helt nytt sätt att tänka kring rörelse och hälsa — ett
            som skiljer sig markant från traditionell sjukvård och
            sjukgymnastik.
          </p>
          <p style={{ marginTop: 16 }}>
            2020 startade jag och min kollega Christopher Cleer Klinik.
            Efter fem år på heltid med Postural Träning, och fantastisk
            respons från våra patienter, såg vi ett tydligt mönster: nästan
            alla behövde jobba med samma grundläggande delar. Modern
            livsstil verkar sätta kroppen ur balans på ett specifikt sätt,
            oftast kopplat till bäcken, ryggrad och skulderblad som tappat
            sin position. Även de med besvär i axlar, knän eller nacke fick
            bäst resultat när vi utgick från dessa delar och kompletterade
            med riktad lokal träning.
          </p>
          <p style={{ marginTop: 16 }}>
            Den insikten — att så många av oss bär på samma obalanser — är
            det som ligger bakom den här hemsidan: tanken att våra
            vanligaste program kan hjälpa en stor majoritet, även utan en
            personlig analys. Jag är utbildad Postural Terapeut via
            Optimum-Metoden och har hittills tagit emot och hjälpt över
            1 500 personer. Nu vill jag nå fler — och erbjuda ett alternativ
            för dig som ännu inte lyckats få ordning på dina problem.
          </p>
        </section>

        <section className={styles.section}>
          <span className="eyebrow">Grundaren</span>
          <h2>Vem som driver ReAlign</h2>
          <div className={styles.founderGrid}>
            <div className={styles.founderPhoto}>
              <Image
                src="/om-oss/felix.jpg"
                alt="Felix Eliasson"
                fill
                sizes="220px"
              />
            </div>
            <div>
              <h3>Felix Eliasson</h3>
              <div className={styles.role}>Grundare, Postural Terapeut</div>
              <p>
                Utbildad Postural Terapeut via Optimum-Metoden. Bakgrund
                inom elitfotboll, med fem års heltidserfarenhet av Postural
                Träning och över 1 500 hjälpta patienter.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <span className="eyebrow">Kliniken</span>
          <h2>Där det hela började</h2>
          <p>
            Cleer Klinik grundades tillsammans med min kollega Christopher,
            och det är här grunden till träningen och programmen på den här
            sidan har formats.
          </p>
          <div className={styles.klinikPhoto}>
            <Image
              src="/om-oss/team.jpg"
              alt="Christopher och Felix på Cleer Klinik"
              fill
              sizes="(max-width: 880px) 100vw, 800px"
            />
          </div>
        </section>

        <section className={styles.section}>
          <span className="eyebrow">Vad vi står för</span>
          <h2>Våra principer</h2>
          <div className={styles.values}>
            <div className={styles.valueCard}>
              <b>Grundorsak, inte symptom</b>
              <p>Vi lindrar inte bara — vi tränar upp musklerna som faktiskt ska bära kroppen.</p>
            </div>
            <div className={styles.valueCard}>
              <b>Hela kroppen, inte delar</b>
              <p>Nacke, rygg och höft hänger ihop. Vi tränar dem som en helhet.</p>
            </div>
            <div className={styles.valueCard}>
              <b>Tillgängligt för alla</b>
              <p>Program, övningsbank och ergonomiguider är fria att använda, oavsett var du bor.</p>
            </div>
          </div>
        </section>

        <div className={styles.ctaBand}>
          <span className="eyebrow" style={{ color: "var(--warm-soft)" }}>
            Vill du träffa oss?
          </span>
          <h2>Boka en personlig videosamtals-analys</h2>
          <p>Vi går igenom din kropp tillsammans och bygger ett program skräddarsytt för dig.</p>
          <a
            className="btn btn-primary"
            href="https://www.bokadirekt.se/boka-tjanst/realign-metoden-136305/postural-traning-analys-och-skraddarsytt-program-3504740"
            target="_blank"
            rel="noopener noreferrer"
          >
            Boka videosamtal – 590 kr →
          </a>
        </div>

        <Footer />
      </div>
    </>
  );
}
