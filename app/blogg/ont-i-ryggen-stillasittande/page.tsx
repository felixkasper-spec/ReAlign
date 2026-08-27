import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogExerciseCard from "@/components/BlogExerciseCard";
import BlogPostCard from "@/components/BlogPostCard";
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

          <div className={styles.perspectiveBox}>
            <span className="eyebrow">Postural träning-perspektivet</span>
            <h2>Ländryggen är sällan grundorsaken — bara där det märks</h2>
            <p>
              Inom Optimum-Metoden och postural träning behandlas
              ländryggssmärta sällan som ett isolerat ländryggsproblem —
              en vinkel de flesta aldrig hör om. Hela kedjan hänger ihop,
              från fötter och knän via höft och bäcken upp genom
              ryggraden. En obalans i bäckenets position kan göra att
              ländryggen tvingas kompensera, långt innan man känner något
              i just ländryggen.
            </p>
            <p>
              Vid mycket stillasittande går sätesmusklerna och de djupa
              bålmusklerna successivt in i ett slags vilomodus — de
              slutar aktiveras som de ska under dagen. Ländryggens ytliga
              muskler tvingas då bära belastning de inte är byggda för,
              dag efter dag. Det är därför en bättre stol sällan räcker —
              det är stödet underifrån, inte ryggen själv, som behöver
              väckas och tränas upp.
            </p>
          </div>

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
              bakåtlutat.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="pelvic-rolls" title="Pelvic Rolls" />
              </div>
            </li>
            <li>
              <b>Katt-och-hund.</b> Rör hela ryggraden genom sitt
              rörelseomfång, motverkar stelhet efter timmar i samma
              position.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="cats-and-dogs" title="Cats and Dogs" />
              </div>
            </li>
            <li>
              <b>Enbens-brygga.</b> Bygger styrka i säte och nedre bål,
              precis de muskler som ska avlasta ländryggen.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="bridge-single-leg" title="Bridge Single Leg" />
              </div>
            </li>
            <li>
              <b>QL-stretch mot vägg.</b> Löser upp spänning i
              ländryggsmuskeln som ofta blir överarbetad vid stillasittande.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="wall-ql-stretch" title="Wall QL Stretch" />
              </div>
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

          <p className={styles.softLink}>
            Om värken är återkommande och du vill förstå var i kedjan din
            egen obalans sitter, kan ett{" "}
            <Link href="/videosamtal">videosamtal med en av våra terapeuter</Link>{" "}
            ge en tydligare bild än att gissa själv.
          </p>

          <h3 className={styles.relatedHead}>Relaterat</h3>
          <div className={styles.relatedGrid}>
            <BlogPostCard
              slug="ont-i-nacken-kontorsarbete"
              title="Ont i nacken av kontorsarbete"
              excerpt="Nackspänning och ländryggssmärta hänger ofta ihop via samma kedja."
            />
            <BlogPostCard
              slug="ont-i-axlarna-skrivbordsarbete"
              title="Ont i axlarna vid skrivbordsarbete"
              excerpt="Rundade, framåtdragna axlar — därför uppstår det och vad som bygger upp motståndet."
            />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
