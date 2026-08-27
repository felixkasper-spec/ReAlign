import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
              mest spänd vid den här typen av huvudvärk. Se{" "}
              <Link href="/ovningsbank/static-dog-neck-retractions">
                Static Dog Neck Retractions
              </Link>
              .
            </li>
            <li>
              <b>Riktad nackträning.</b> Bygger upp uthålligheten i
              nackens stödmuskler, så de klarar hela arbetsdagen utan att
              bli lika spända. Se{" "}
              <Link href="/ovningsbank/hooklying-neck-training">
                Hooklying Neck Training
              </Link>
              .
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
        </div>

        <Footer />
      </div>
    </>
  );
}
