import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpotifyEmbed from "@/components/SpotifyEmbed";
import { getSpotifyOembed } from "@/lib/spotify";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Om metoden — ReAlign Metoden",
  description:
    "Vad är postural träning och varför fungerar det? Läs om Optimum-Metoden — grunden bakom ReAlign Metoden.",
  image: "/og/om-metoden.png",
  path: "/om-metoden",
});

const EPISODE_ID = "7kRVHZhGfmsZCOqJjtyPFF";

export default async function OmMetodenPage() {
  const podcastPreview = await getSpotifyOembed(EPISODE_ID);

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.heroRow}>
          <div className={styles.hero}>
            <span className="eyebrow">Om metoden</span>
            <h1>
              Vad är egentligen <em>postural träning</em>?
            </h1>
            <p>
              Inte stretching. Inte styrketräning i vanlig mening. Postural
              träning handlar om att återge kroppen dess naturliga förmåga
              att bära och fördela belastning — muskel för muskel, tills
              helheten fungerar som den ska.
            </p>
          </div>
          <div className={`img-duo ${styles.heroImage}`}>
            <Image
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&h=560&q=80&sat=-100&con=6&bri=5"
              alt="Postural träning i solnedgången"
              fill
              sizes="(max-width: 800px) 100vw, 440px"
              priority
            />
          </div>
        </div>

        <div className={styles.section} style={{ borderTop: "none", paddingTop: 0 }}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Ursprunget</span>
            <h2>Grundad i Optimum-Metoden — ovanligt tillgänglig.</h2>
          </div>
          <p>
            ReAlign Metoden bygger på Optimum-Metoden, en etablerad
            utbildning inom postural träning. Felix, grundaren bakom
            ReAlign Metoden, är utbildad Postural Terapeut via
            Optimum-Metoden efter fem års heltidsarbete med metoden på
            Cleer Klinik.
          </p>
          <p>
            Tillgång till Optimum-Metoden kräver normalt antingen ett besök
            hos en fysisk utövare eller en bokad onlinesession. Här får du
            samma grund öppet och till stor del helt gratis — inget vi
            känner till att någon annan erbjuder i samma omfattning.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Grundorsaken</span>
            <h2>Varför gör det ont — egentligen?</h2>
          </div>
          <p>
            Kronisk värk i kroppen handlar sällan om en enskild skada.
            Oftast har muskler och leder gradvis förlorat sin förmåga att
            fördela den belastning kroppen utsätts för i vardagen. När det
            sker tar andra muskler över — ofta ytligare muskler som inte är
            gjorda för att bära det ansvaret långsiktigt. Resultatet blir
            över- eller snedbelastning, och till slut smärta och sämre
            prestationsförmåga.
          </p>
          <p>
            Det är därför så många upplever att lindring från olika
            behandlingar eller träningsformer bara håller i sig en kort
            period — grundorsaken, den förlorade belastningsfördelningen,
            är fortfarande kvar.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Skillnaden</span>
            <h2>Postural träning vs. traditionell träning &amp; rehab</h2>
          </div>
          <div className={styles.compare2}>
            <div className={`${styles.compCol} ${styles.trad}`}>
              <span className={styles.lbl}>Traditionellt</span>
              <ul>
                <li>Fokuserar på symptomet — den onda punkten</li>
                <li>Tränar ofta samma ytliga muskler som redan kompenserar</li>
                <li>Lindring är vanligtvis tillfällig</li>
                <li>Sällan koppling mellan kroppens olika delar</li>
              </ul>
            </div>
            <div className={`${styles.compCol} ${styles.postural}`}>
              <span className={styles.lbl}>Postural träning</span>
              <ul>
                <li>Fokuserar på grundorsaken — belastningsfördelningen</li>
                <li>Väcker och stärker de djupare hållningsmusklerna</li>
                <li>Byggd för varaktig, bestående förändring</li>
                <li>Ser och tränar kroppen som ett sammanhängande system</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Vem passar det för</span>
            <h2>Vanliga anledningar att börja</h2>
          </div>
          <div className={styles.reasonRow}>
            <div className={`img-duo warm ${styles.reasonImage}`}>
              <Image
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&h=700&q=80&sat=-100&con=6&bri=5"
                alt="Person tränar bålstyrka på matta"
                fill
                sizes="(max-width: 800px) 100vw, 340px"
              />
            </div>
            <div>
              <p style={{ marginBottom: 10 }}>
                Postural träning passar de flesta — oavsett ålder eller
                träningsbakgrund. Några vanliga skäl till att man börjar:
              </p>
              <div className={styles.reasonGrid}>
                <div className={styles.reason}>
                  <b>Återkommande spänningar</b>Nacke, axlar eller rygg som
                  ständigt känns stel eller öm.
                </div>
                <div className={styles.reason}>
                  <b>Stillasittande vardag</b>Kontorsarbete och skärmtid som
                  satt tydliga spår i hållningen.
                </div>
                <div className={styles.reason}>
                  <b>Återkommande skador</b>Samma typ av besvär som kommer
                  tillbaka gång på gång.
                </div>
                <div className={styles.reason}>
                  <b>Begränsad rörlighet</b>Stelhet som gör vardagliga
                  rörelser tyngre än de borde vara.
                </div>
                <div className={styles.reason}>
                  <b>Vill prestera bättre</b>Idrottare som vill träna
                  smartare och minska skaderisk.
                </div>
                <div className={styles.reason}>
                  <b>Vill bara må bättre</b>Ingen akut smärta — men en
                  känsla av att kroppen kunde fungera bättre.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section} style={{ borderTop: "none", paddingTop: 0 }}>
          <div className={styles.muscleNote}>
            <span className={styles.ic}>◐</span>
            <p>
              <b>Det handlar om hållningsmusklerna.</b> Ländrygg, mage, säte
              och nacke är inte designade för att hålla uppe kroppen i sig —
              det är hållningsmusklernas jobb. När de tappar styrka tar de
              ytliga musklerna över, vilket sliter på kroppen på sikt. Det
              är därför vår träning bygger på progressiv belastningsökning
              specifikt riktad mot dessa muskler, precis som i våra{" "}
              <Link href="/program" style={{ color: "var(--sage)", textDecoration: "underline" }}>
                färdiga program
              </Link>
              .
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.deepDive}>
            <span className="eyebrow">Fördjupning</span>
            <p>
              Om du vill fördjupa dig ytterligare i filosofin bakom
              träningen, rekommenderar vi att du lyssnar på detta
              podcast-avsnitt.
            </p>
            <div className={styles.spotifyFrame}>
              <SpotifyEmbed episodeId={EPISODE_ID} preview={podcastPreview} />
            </div>
          </div>
        </div>

        <div className={styles.ctaBand}>
          <span className="eyebrow" style={{ color: "var(--warm-soft)" }}>
            Redo att testa själv
          </span>
          <h2>Känn skillnaden på egen kropp.</h2>
          <p>Helt gratis. Prova ett kort program redan idag och känn skillnaden direkt.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="btn btn-primary btn-lg" href="/program/helkropp-niva-2?langd=kort">
              Testa ett kort program
            </Link>
            <Link className="btn btn-primary btn-lg" href="/program">
              Alla program
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
