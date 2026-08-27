import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "../blog-post.module.css";

export const metadata = pageMetadata({
  title: "Hur ofta bör man träna hållning? — ReAlign Metoden",
  description:
    "Ett enkelt svar på en fråga som ofta känns krångligare än den behöver vara — utan att kräva perfektion.",
  image: "/og/default.png",
  path: "/blogg/hur-ofta-bor-man-trana-hallning",
});

export default function BlogPost() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Komma igång</span>
          <h1>Hur ofta bör man träna hållning?</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <p className={styles.lead}>
            Det korta svaret: det varierar per program, men de flesta
            rekommenderar 2–5 pass i veckan. Det längre svaret är mer
            intressant — och mer förlåtande än du kanske tror.
          </p>
        </header>

        <div className={styles.article}>
          <h2>Regelbundenhet slår perfektion</h2>
          <p>
            Även korta pass ett par gånger i veckan, eller vid behov, gör
            skillnad — det viktigaste är regelbundenhet, inte att träffa
            ett exakt antal pass varje vecka. Kroppen bygger upp
            hållningsmusklerna gradvis, och den processen bryts inte av att
            du missar en dag eller två.
          </p>
          <p>
            Många känner en skillnad redan efter första passet — en
            lätthetskänsla i kroppen. Mer varaktiga förändringar i hållning
            och styrka tar längre tid, ofta några veckor av regelbunden
            träning, eftersom det handlar om att bygga upp riktig
            muskelstyrka i de djupa hållningsmusklerna, inte bara lösa upp
            tillfällig spänning.
          </p>

          <h2>Vad om jag missar några dagar?</h2>
          <p>
            Det är okej att pausa — det som räknas är att du kommer
            tillbaka. Ett enstaka missat pass, eller till och med några
            dagars uppehåll, gör ingen större skillnad över tid. Det som
            faktiskt bromsar framsteg är att sluta helt under lång tid, inte
            enstaka avbrott i en i övrigt regelbunden rutin.
          </p>

          <h2>Vilket program passar din vardag?</h2>
          <p>
            Det beror på var det gör mest ont, hur van du är vid träning
            sedan innan, och hur mycket tid du vill lägga per pass. Vår{" "}
            <Link href="/analys">guidning</Link> ställer några korta frågor
            och ger dig en rekommendation direkt, helt automatiskt.
          </p>

          <div className={styles.ctaBand}>
            <p>Osäker på var du ska börja?</p>
            <Link className="btn btn-primary" href="/analys">
              Hitta rätt program →
            </Link>
          </div>

          <p>
            Fler vanliga frågor om träningen finns samlade på vår{" "}
            <Link href="/faq">FAQ-sida</Link>.
          </p>
        </div>

        <Footer />
      </div>
    </>
  );
}
