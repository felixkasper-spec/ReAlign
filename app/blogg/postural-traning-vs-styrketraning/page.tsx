import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "../blog-post.module.css";

export const metadata = pageMetadata({
  title: "Postural träning vs. vanlig styrketräning — skillnaden — ReAlign Metoden",
  description:
    "Postural träning ser ut som vanlig träning på ytan, men syftet och musklerna som prioriteras skiljer sig markant.",
  image: "/og/default.png",
  path: "/blogg/postural-traning-vs-styrketraning",
});

export default function BlogPost() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Postural träning</span>
          <h1>Postural träning vs. vanlig styrketräning — vad är skillnaden?</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <p className={styles.lead}>
            Övningarna kan se förvillande lika ut på ytan — men fokuset,
            musklerna som prioriteras och målet skiljer sig markant mellan
            postural träning och traditionell styrketräning.
          </p>
        </header>

        <div className={styles.article}>
          <h2>Traditionell träning fokuserar på symptomet</h2>
          <p>
            Traditionell träning och rehab tenderar att fokusera på den
            onda punkten, och tränar ofta samma ytliga muskler som redan
            kompenserar för en underliggande obalans. Lindringen blir
            vanligtvis tillfällig, eftersom grundorsaken — hur belastningen
            fördelas genom hela kroppen — sällan adresseras.
          </p>

          <h2>Postural träning fokuserar på grundorsaken</h2>
          <p>
            Postural träning väcker och stärker istället de djupare
            hållningsmusklerna som ska bära belastningen från början —
            ländrygg, mage, säte och nacke. Det är byggt för varaktig
            förändring snarare än snabb lindring, och ser kroppen som ett
            sammanhängande system istället för isolerade delar.
          </p>

          <h2>Kompletterar de varandra?</h2>
          <p>
            Ja, absolut. Postural träning kompletterar annan träning bra
            eftersom den bygger upp de djupa musklerna som stabiliserar
            kroppen — vilket ofta förbättrar prestationen i annan träning
            också. Man behöver inte välja bort styrketräning eller annan
            träningsform för att träna posturalt; snarare bygger det ena
            grunden för det andra.
          </p>

          <p>
            Vill du läsa mer om filosofin och grundorsaken bakom metoden?
            Se <Link href="/om-metoden">Om metoden</Link>.
          </p>

          <div className={styles.ctaBand}>
            <p>Känn skillnaden själv, helt gratis:</p>
            <Link className="btn btn-primary" href="/program">
              Se alla program →
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
