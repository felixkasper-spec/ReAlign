import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "../blog-post.module.css";

export const metadata = pageMetadata({
  title: "Kontorsergonomi — komplett guide för hemmakontoret — ReAlign Metoden",
  description:
    "Stol, skärm, skrivbord och pauser — en konkret checklista för en arbetsplats som inte sliter på kroppen.",
  image: "/og/default.png",
  path: "/blogg/kontorsergonomi-guide",
});

export default function BlogPost() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Kontorsergonomi</span>
          <h1>Kontorsergonomi — komplett guide för hemmakontoret</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <p className={styles.lead}>
            Rätt ergonomi handlar inte om en perfekt, statisk position —
            den finns inte. Det handlar om att ta bort de värsta
            belastningarna och variera ställning genom dagen. Här är en
            konkret checklista.
          </p>
        </header>

        <div className={styles.article}>
          <h2>Stolen</h2>
          <p>
            Fötterna ska vila platt mot golvet med knäna i ungefär 90
            graders vinkel. Sitt så långt bak i stolen att ryggstödet
            faktiskt stödjer ländryggen — många sitter för långt fram och
            får då inget stöd alls.
          </p>

          <h2>Skrivbordet och armarna</h2>
          <p>
            Bordshöjden ska tillåta armbågarna att vila i ungefär 90
            grader när du skriver, med axlarna avslappnade — inte uppdragna
            mot öronen.
          </p>

          <h2>Skärmen</h2>
          <p>
            Skärmens överkant bör ligga ungefär i ögonhöjd, på armlängds
            avstånd. En skärm som står för lågt är en av de vanligaste
            orsakerna till framåtskjutet huvud och nackspänning — se{" "}
            <Link href="/blogg/ont-i-nacken">
              vår artikel om ont i nacken
            </Link>{" "}
            för mer om varför det spelar roll.
          </p>

          <h2>Rörelse — den viktigaste punkten</h2>
          <p>
            Ingen arbetsställning, hur korrekt den än är, mår bra av att
            hållas i timmar utan avbrott. Byt position, res dig, gå några
            steg minst en gång var 30:e minut. Om du har möjlighet att
            variera mellan sittande och stående är det värdefullt — men
            själva variationen är poängen, inte att stå hela dagen. Läs
            mer i{" "}
            <Link href="/blogg/hjalper-staskrivbord-mot-dalig-hallning">
              vår artikel om ståskrivbord
            </Link>
            .
          </p>

          <h2>Kroppen bakom skrivbordet</h2>
          <p>
            En bra arbetsplats minskar belastningen, men löser inte en
            hållning som redan tappat sitt naturliga stöd. Det kräver
            riktad träning av hållningsmusklerna, inte bara rätt
            möbelinställning — läs mer om{" "}
            <Link href="/om-metoden">filosofin bakom det</Link>.
          </p>

          <div className={styles.ctaBand}>
            <p>Ett kort, gratis program byggt just för kontorsvardagen:</p>
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
