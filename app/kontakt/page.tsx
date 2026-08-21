import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "./ContactForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Kontakt — ReAlign Metoden",
  description:
    "Kontakta ReAlign Metoden — frågor om träning, bokning av videosamtal, eller teknisk support.",
};

export default function KontaktPage() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header style={{ padding: "40px 0 30px" }}>
          <span className="eyebrow">Kontakt</span>
          <h1 style={{ fontSize: "2.5rem", marginTop: 12 }}>Vi hör gärna av oss.</h1>
          <p style={{ color: "var(--text-soft)", marginTop: 14, fontSize: "1rem", maxWidth: 560 }}>
            Frågor om träningen, bokning av videosamtal, eller behöver du
            teknisk hjälp? Välj det som passar bäst nedan.
          </p>
        </header>

        <div className={styles.contactGrid}>
          <div className={styles.contactCard}>
            <span className={styles.ic}>💬</span>
            <h3>Allmänna frågor</h3>
            <p>Om träningen, programmen eller metoden.</p>
            <a className={styles.link} href="mailto:hej@cleerklinik.se">
              hej@cleerklinik.se
            </a>
          </div>
          <div className={styles.contactCard}>
            <span className={styles.ic}>📅</span>
            <h3>Boka videosamtal</h3>
            <p>Personlig analys och skräddarsytt program.</p>
            <Link className={styles.link} href="/analys">
              Boka tid →
            </Link>
          </div>
          <div className={styles.contactCard}>
            <span className={styles.ic}>🛠</span>
            <h3>Teknisk support</h3>
            <p>Problem med inloggning, appen eller ditt konto.</p>
            <a className={styles.link} href="mailto:support@cleerklinik.se">
              support@cleerklinik.se
            </a>
          </div>
        </div>

        <ContactForm />

        <Footer />
      </div>
    </>
  );
}
