import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "../blog-post.module.css";

export const metadata = pageMetadata({
  title: "Ont i ryggen av stillasittande — vanligaste orsakerna — ReAlign Metoden",
  description:
    "Varför långvarigt sittande ger ont i ländryggen, och vilka övningar som faktiskt bygger upp stödet du saknar.",
  image: "/og/default.png",
  path: "/blogg/ont-i-ryggen-stillasittande",
});

export default function BlogPost() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Rygg & stillasittande</span>
          <h1>Ont i ryggen av stillasittande — vanligaste orsakerna och vad som hjälper</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <p className={styles.lead}>
            En dov värk i nedre ryggen efter en dag vid skrivbordet är
            extremt vanligt — men &quot;sitta mer rakt&quot; är sällan hela lösningen.
            Här är vad som faktiskt ligger bakom det, och vad som hjälper.
          </p>
        </header>

        <div className={styles.article}>
          <h2>Varför gör ländryggen ont av att sitta?</h2>
          <p>
            När vi sitter länge slappnar sätesmusklerna och de djupa
            bålmusklerna av, medan bäckenet ofta glider ner i en bakåtlutad
            position. Ländryggen tappar då sitt naturliga stöd underifrån,
            och de ytliga ryggmusklerna får jobba övertid för att hålla
            uppe överkroppen — ett jobb de inte är byggda för på lång sikt.
          </p>
          <p>
            Resultatet blir stelhet och värk, ofta som förvärras mot
            eftermiddagen. Lösningen är sällan bara en bättre stol — det
            handlar om att bygga upp styrkan i höft, bäcken och bål som
            faktiskt ska bära belastningen.
          </p>

          <h2>Övningar som bygger upp stödet</h2>
          <ol>
            <li>
              <b>Bäckenrullningar.</b> Mjuka rörelser som lär bäckenet att
              hitta en neutral position igen, istället för att fastna
              bakåtlutat. Se{" "}
              <Link href="/ovningsbank/pelvic-rolls">Pelvic Rolls</Link>.
            </li>
            <li>
              <b>Katt-och-hund.</b> Rör hela ryggraden genom sitt
              rörelseomfång, motverkar stelhet efter timmar i samma
              position. Se{" "}
              <Link href="/ovningsbank/cats-and-dogs">Cats and Dogs</Link>.
            </li>
            <li>
              <b>Enbens-brygga.</b> Bygger styrka i säte och nedre bål,
              precis de muskler som ska avlasta ländryggen. Se{" "}
              <Link href="/ovningsbank/bridge-single-leg">
                Bridge Single Leg
              </Link>
              .
            </li>
            <li>
              <b>QL-stretch mot vägg.</b> Löser upp spänning i
              ländryggsmuskeln som ofta blir överarbetad vid stillasittande.
              Se{" "}
              <Link href="/ovningsbank/wall-ql-stretch">
                Wall QL Stretch
              </Link>
              .
            </li>
            <li>
              <b>Res dig regelbundet.</b> Ingen övning ersätter att faktiskt
              bryta stillasittandet. Sikta på att stå upp och röra dig
              någon minut varje halvtimme.
            </li>
          </ol>

          <div className={styles.ctaBand}>
            <p>Ett ordnat program för höft och bäcken, helt gratis:</p>
            <Link className="btn btn-primary" href="/program/hofter-niva-1">
              Testa Höft & bäcken — Nivå 1, gratis →
            </Link>
          </div>

          <p>
            Har du också spänningar i nacke eller axlar? Läs om{" "}
            <Link href="/blogg/ont-i-nacken-kontorsarbete">
              ont i nacken av kontorsarbete
            </Link>{" "}
            också — de hänger ofta ihop.
          </p>
        </div>

        <Footer />
      </div>
    </>
  );
}
