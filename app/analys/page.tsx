import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuizClient from "./QuizClient";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Hitta rätt program — ReAlign Metoden",
  description:
    "Svara på fem korta frågor om var det gör ont och din vardag — få en programrekommendation direkt, helt automatiskt.",
  image: "/og/analys.png",
  path: "/analys",
});

export default function AnalysPage() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Personlig träningsplan</span>
          <h1>Hitta rätt program för dig.</h1>
          <p>
            Svara på fem korta frågor så sätter vi ihop en rekommendation
            utifrån var det gör ont, din erfarenhet och din vardag — helt
            automatiskt, direkt.
          </p>
        </header>

        <QuizClient />

        <div className={styles.teaser}>
          <span className="eyebrow">Kommer snart</span>
          <h3>Full funktionsanalys</h3>
          <p>
            Vi bygger just nu en fördjupad version där du gör enkla
            rörelsetester hemma via video, och får ett program byggt
            specifikt kring dina egna obalanser — inte bara var det gör ont.
            Håll utkik.
          </p>
        </div>

        <Footer />
      </div>
    </>
  );
}
