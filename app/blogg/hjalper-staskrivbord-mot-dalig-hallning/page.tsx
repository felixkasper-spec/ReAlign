import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "../blog-post.module.css";

export const metadata = pageMetadata({
  title: "Hjälper ett ståskrivbord mot dålig hållning? — ReAlign Metoden",
  description:
    "Ståskrivbord marknadsförs ofta som lösningen på kontorshållning. Sanningen är lite mer nyanserad än så.",
  image: "/og/default.png",
  path: "/blogg/hjalper-staskrivbord-mot-dalig-hallning",
});

export default function BlogPost() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Ståskrivbord</span>
          <h1>Hjälper ett ståskrivbord verkligen mot dålig hållning?</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <p className={styles.lead}>
            Ståskrivbord säljs ofta som lösningen på kontorshållning. Det
            är delvis sant — men om du bara byter stillasittande mot
            stillastående löser du inte grundproblemet.
          </p>
        </header>

        <div className={styles.article}>
          <h2>Vad ett ståskrivbord faktiskt löser</h2>
          <p>
            Fördelen med ett ståskrivbord är inte att stående i sig är
            bättre än sittande — det är att det gör det enkelt att{" "}
            <b>variera</b> arbetsställning genom dagen. Variation avlastar
            vävnaderna på ett sätt som varken ren sittning eller ren
            ståning gör.
          </p>
          <p>
            Om du däremot står stilla i timmar med samma svankande,
            framåtlutade hållning som du hade sittande, flyttar du bara
            problemet — du löser det inte. Kroppen behöver fortfarande
            styrkan att hålla sig upprätt, oavsett position.
          </p>

          <h2>Så får du ut mest av ett ståskrivbord</h2>
          <ol>
            <li>
              <b>Byt position ofta.</b> Sikta på att alternera sittande och
              stående var 30–60:e minut, snarare än att stå hela dagen.
            </li>
            <li>
              <b>Håll skärmen i ögonhöjd oavsett läge.</b> Ett vanligt
              misstag är att skärmen bara är rätt inställd i en av
              positionerna. Se vår{" "}
              <Link href="/blogg/kontorsergonomi-guide">
                ergonomiguide för kontoret
              </Link>
              .
            </li>
            <li>
              <b>Träna upp hållningsmusklerna separat.</b> Ett skrivbord —
              oavsett typ — löser aldrig svag hållningsmuskulatur. Det
              kräver riktad träning.
            </li>
          </ol>

          <div className={styles.ctaBand}>
            <p>
              Vill du bygga upp styrkan som faktiskt håller dig upprätt,
              oavsett skrivbord?
            </p>
            <Link className="btn btn-primary" href="/program/kontorsvardag">
              Testa Kontorsvardag, gratis →
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
