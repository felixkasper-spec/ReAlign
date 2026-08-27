import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogExerciseCard from "@/components/BlogExerciseCard";
import BlogPostCard from "@/components/BlogPostCard";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "../blog-post.module.css";

export const metadata = pageMetadata({
  title: "Spänningshuvudvärk och hållning — finns sambandet? — ReAlign Metoden",
  description:
    "Många upplever att huvudvärken förvärras mot eftermiddagen efter en dag vid skärmen. Så hänger nacke, hållning och spänningshuvudvärk ihop.",
  image: "/og/default.png",
  path: "/blogg/spanningshuvudvark-och-hallning",
});

export default function BlogPost() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Huvudvärk & hållning</span>
          <h1>Spänningshuvudvärk och hållning — finns sambandet?</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <p className={styles.lead}>
            Många som sitter mycket vid skärm märker att huvudvärken smyger
            sig på mot eftermiddagen. Det är sällan en slump — spänd nacke
            och käkmuskulatur är en av de vanligaste utlösande faktorerna.
          </p>
        </header>

        <div className={styles.article}>
          <h2>Hur hänger det ihop?</h2>
          <p>
            Spänningshuvudvärk beskrivs ofta som ett band runt huvudet, och
            en vanlig bidragande orsak är spänd muskulatur i nacke,
            käkparti och övre skuldror. När hållningsmusklerna i nacken
            tröttnar av att bära huvudets vikt i en framåtskjuten position
            hela dagen, ökar spänningen i de omkringliggande musklerna —
            och den spänningen kan stråla upp mot huvudet.
          </p>

          <div className={styles.perspectiveBox}>
            <span className="eyebrow">Postural träning-perspektivet</span>
            <h2>Varför massage och smärtstillande bara lindrar tillfälligt</h2>
            <p>
              En vinkel som sällan lyfts: inom postural träning ses den
              här typen av huvudvärk sällan som
              ett problem i huvudet överhuvudtaget — ursprunget sitter
              längre ner i kedjan, oftast i nacke och bröstrygg. Massage
              och smärtstillande kan lindra symptomet för stunden, men
              adresserar inte varför spänningen byggs upp om och om igen.
            </p>
            <p>
              Grundorsaken är samma mönster som vid vanlig nackspänning:
              vid mycket stillasittande går de djupa hållningsmusklerna in
              i vilomodus, vilket tvingar ytligare muskler i nacke och
              käkparti att kompensera. Ska huvudvärken faktiskt bli mer
              sällsynt, inte bara mindre intensiv för stunden, behöver de
              djupa musklerna tränas upp — inte bara den spända ytan
              lösas upp.
            </p>
          </div>

          <p>
            Det betyder inte att all huvudvärk kommer från hållningen —
            men för den som märker ett tydligt mönster kopplat till långa
            dagar vid skärmen är nack- och axelspänning värt att titta
            närmare på, innan man förlitar sig enbart på smärtstillande.
          </p>

          <h2>Vad som brukar lindra</h2>
          <ol>
            <li>
              <b>Hakindragningar.</b> Avlastar den muskulatur som ofta är
              mest spänd vid den här typen av huvudvärk.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard
                  slug="static-dog-neck-retractions"
                  title="Static Dog Neck Retractions"
                />
              </div>
            </li>
            <li>
              <b>Riktad nackträning.</b> Bygger upp uthålligheten i
              nackens stödmuskler, så de klarar hela arbetsdagen utan att
              bli lika spända.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard
                  slug="hooklying-neck-training"
                  title="Hooklying Neck Training"
                />
              </div>
            </li>
            <li>
              <b>Regelbundna skärmpauser.</b> Både för ögonen och nacken —
              sikta på en kort paus var 30:e minut.
            </li>
            <li>
              <b>Kontrollera skärmhöjden.</b> En skärm för lågt eller för
              högt placerad tvingar nacken till en onaturlig vinkel hela
              dagen. Se vår <Link href="/ergonomi">ergonomiguide</Link>.
            </li>
          </ol>

          <p style={{ fontSize: "0.85rem", color: "var(--text-soft)" }}>
            Har du återkommande eller svår huvudvärk bör du alltid rådgöra
            med en läkare — det här ersätter inte medicinsk bedömning.
          </p>

          <div className={styles.ctaBand}>
            <p>Vill du ha ett ordnat program mot nack- och axelspänningar?</p>
            <Link
              className="btn btn-primary"
              href="/program/axlar-nacke-skulderblad-niva-1"
            >
              Testa Axlar/nacke/skulderblad — Nivå 1, gratis →
            </Link>
          </div>

          <p className={styles.softLink}>
            Om huvudvärken är återkommande och du vill förstå grundorsaken
            bättre, kan ett{" "}
            <Link href="/videosamtal">videosamtal med en av våra terapeuter</Link>{" "}
            ge en tydligare bild.
          </p>

          <h3 className={styles.relatedHead}>Relaterat</h3>
          <div className={styles.relatedGrid}>
            <BlogPostCard
              slug="ont-i-nacken"
              title="Ont i nacken"
              excerpt="Samma grundorsak som ofta ligger bakom spänningshuvudvärk — så tränar du bort den."
            />
            <BlogPostCard
              slug="ont-i-axeln"
              title="Ont i axeln"
              excerpt="Rundade, framåtdragna axlar — därför uppstår det och vad som bygger upp motståndet."
            />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
