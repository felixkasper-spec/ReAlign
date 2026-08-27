import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "../blog-post.module.css";

export const metadata = pageMetadata({
  title: "Vanliga tecken på dålig hållning — ReAlign Metoden",
  description:
    "Så upptäcker du de vanligaste tecknen på hållningsobalans hos dig själv, innan de hinner bli till smärta.",
  image: "/og/default.png",
  path: "/blogg/tecken-pa-dalig-hallning",
});

export default function BlogPost() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Självcheck</span>
          <h1>Vanliga tecken på dålig hållning — och hur du upptäcker dem hos dig själv</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <p className={styles.lead}>
            Hållningsobalanser byggs ofta upp gradvis, långt innan de gör
            ont. Här är de vanligaste tecknen att hålla utkik efter.
          </p>
        </header>

        <div className={styles.article}>
          <h2>Fem vanliga tecken</h2>
          <ol>
            <li>
              <b>Framåtskjutet huvud.</b> Om huvudet vilar framför axlarna
              istället för rakt ovanpå dem, ofta tydligast i profil framför
              en spegel eller på ett foto från sidan.
            </li>
            <li>
              <b>Rundade, framåtdragna axlar.</b> Ett tecken på att
              bröstmuskulaturen dominerar över den svagare
              skulderbladsmuskulaturen bakom.
            </li>
            <li>
              <b>Ökad svank i ländryggen.</b> Bäckenet lutar framåt, ofta
              kopplat till försvagad bål- och sätesmuskulatur.
            </li>
            <li>
              <b>Ojämn viktfördelning stående.</b> Om du märker att du
              konsekvent lägger mer vikt på ena benet, eller att skorna
              slits ojämnt, kan det peka på en obalans genom hela kroppen.
            </li>
            <li>
              <b>Återkommande stelhet i samma område.</b> Nacke, axlar
              eller rygg som ständigt känns stel eller öm, även utan någon
              specifik skada — ofta ett tecken på att samma muskler får
              kompensera dag efter dag.
            </li>
          </ol>

          <h2>Vad gör man åt det?</h2>
          <p>
            Inget av det här kräver panik — de här mönstren är extremt
            vanliga, särskilt vid mycket stillasittande. Men de brukar inte
            försvinna av sig själva heller. Grundorsaken är oftast att
            hållningsmusklerna gradvis förlorat sin förmåga att fördela
            belastningen kroppen utsätts för — läs mer om{" "}
            <Link href="/om-metoden">varför det gör ont egentligen</Link>.
          </p>
          <p>
            Vill du ha en konkret rekommendation utifrån just dina symptom?
            Vår <Link href="/analys">guidning</Link> ställer några korta
            frågor och ger dig ett förslag på program direkt.
          </p>

          <div className={styles.ctaBand}>
            <p>Ta reda på var du bör börja:</p>
            <Link className="btn btn-primary" href="/analys">
              Hitta rätt program →
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
