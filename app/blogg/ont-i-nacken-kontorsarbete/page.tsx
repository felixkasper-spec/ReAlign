import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "../blog-post.module.css";

export const metadata = pageMetadata({
  title: "Ont i nacken av kontorsarbete — så tränar du bort det — ReAlign Metoden",
  description:
    "Varför stillasittande skapar nackspänningar i första hand, och fem konkreta övningar som faktiskt gör skillnad.",
  image: "/og/default.png",
  path: "/blogg/ont-i-nacken-kontorsarbete",
});

export default function BlogPost() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Nacke & kontorsarbete</span>
          <h1>Ont i nacken av kontorsarbete — så tränar du bort det</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <p className={styles.lead}>
            Spänd, stel eller öm nacke efter en dag framför skärmen är en av
            de vanligaste sakerna vi hör om. Den goda nyheten: det går
            nästan alltid att träna bort, om man förstår varför den uppstår
            i första hand.
          </p>
        </header>

        <div className={styles.article}>
          <h2>Varför gör nacken ont av stillasittande?</h2>
          <p>
            Det handlar sällan om att nacken i sig är svag. Oftast har
            hållningsmusklerna i övre rygg och skulderblad tappat förmågan
            att bära huvudets vikt över tid, vilket gör att ytligare
            muskler i nacke och axlar tvingas ta över jobbet. De musklerna
            är inte byggda för att hålla den belastningen hela dagar i
            sträck — resultatet blir spänning, stelhet och ibland
            spänningshuvudvärk mot slutet av dagen.
          </p>
          <p>
            Ett framåtskjutet huvud — vanligt vid skärmarbete — förvärrar
            det ytterligare: varje centimeter huvudet flyttas framför
            axlarna ökar belastningen på nacken avsevärt. Läs mer om{" "}
            <Link href="/om-metoden">filosofin bakom det här</Link> om du
            vill förstå grundorsaken djupare.
          </p>

          <h2>Fem övningar som faktiskt hjälper</h2>
          <ol>
            <li>
              <b>Hakindragningar (chin tucks).</b> Dra hakan rakt bakåt, som
              om du gör en dubbelhaka, utan att böja huvudet nedåt. Stärker
              precis de djupa nackmusklerna som håller huvudet i rätt läge.
              Testa{" "}
              <Link href="/ovningsbank/static-dog-neck-retractions">
                Static Dog Neck Retractions
              </Link>{" "}
              i övningsbanken för en guidad variant.
            </li>
            <li>
              <b>Axelrullningar.</b> Långsamma cirklar bakåt med axlarna,
              några gånger i timmen om du sitter mycket. Motverkar att
              axlarna gradvis kryper framåt och uppåt under dagen. Se{" "}
              <Link href="/ovningsbank/standing-shoulder-rolls">
                Standing Shoulder Rolls
              </Link>
              .
            </li>
            <li>
              <b>Riktad nackträning.</b> Kontrollerad styrketräning för
              nackens djupa muskler, inte bara stretching — det är styrkan
              som saknas, inte rörligheten. Se{" "}
              <Link href="/ovningsbank/hooklying-neck-training">
                Hooklying Neck Training
              </Link>
              .
            </li>
            <li>
              <b>Bröstryggsrörlighet.</b> Stel bröstrygg tvingar nacke och
              axlar att kompensera för rörelser de inte är byggda för. Några
              minuters mobilitetsarbete här avlastar nacken indirekt.
            </li>
            <li>
              <b>Regelbundna pauser — inte bara rätt stol.</b> Ingen
              arbetsställning är rätt om du sitter i den i sex timmar rakt
              av. Byt position, res dig, gå några steg var 30:e minut. Se
              vår <Link href="/ergonomi">ergonomiguide</Link> för fler
              konkreta tips på arbetsplatsen.
            </li>
          </ol>

          <div className={styles.ctaBand}>
            <p>
              Vill du ha ett färdigt, ordnat program för just det här —
              istället för att pussla ihop övningar själv?
            </p>
            <Link className="btn btn-primary" href="/program/axlar-nacke-skulderblad-niva-1">
              Testa Axlar/nacke/skulderblad — Nivå 1, gratis →
            </Link>
          </div>

          <p>
            Programmet ovan är helt gratis och kräver inget konto för att
            komma igång. Vill du ha hela programbiblioteket, alla
            övningsvideor och progressionsspårning, finns det i{" "}
            <Link href="/premium">Premium</Link>.
          </p>
        </div>

        <Footer />
      </div>
    </>
  );
}
