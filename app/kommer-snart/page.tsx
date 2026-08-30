import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Kommer snart — ReAlign Metoden",
  description:
    "Community-forum, veckobrev, gruppträning via video, hållnings- och funktionsanalys med mera — se vad vi bygger härnäst.",
  image: "/og/kommer-snart.png",
  path: "/kommer-snart",
});

const items = [
  {
    ic: "◐",
    title: "Hållnings- och funktionsanalys",
    desc: "Videobaserad självanalys som visar var din kropp bär sina obalanser.",
  },
  {
    ic: "✎",
    title: "Community-forum",
    desc: "Dela framsteg, ställ frågor och motivera varandra.",
  },
  {
    ic: "✉",
    title: "Veckobrev med tips",
    desc: "Regelbundna mejl med råd, nya övningar och påminnelser.",
  },
  {
    ic: "▶",
    title: "Gruppträning via video",
    desc: "Schemalagda livepass tillsammans med andra.",
  },
  {
    ic: "↗",
    title: "Smarta påminnelser",
    desc: "Automatiska notiser inför schemalagda pass, kopplat till din träningskalender.",
  },
  {
    ic: "▤",
    title: "Webb-butik",
    desc: "Utrustning och tillbehör som kompletterar din träning.",
  },
];

export default function KommerSnartPage() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Under utveckling</span>
          <h1>Kommer snart.</h1>
          <p>
            Sidan växer löpande. Det här är på gång härnäst — helt gratis
            att använda redan idag, och detta gör upplevelsen ännu bättre.
          </p>
        </header>

        <div className={styles.list}>
          {items.map((item) => (
            <div className={styles.item} key={item.title}>
              <div className={styles.itemIc}>{item.ic}</div>
              <div className={styles.itemBody}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
              <span className={styles.badge}>Kommer snart</span>
            </div>
          ))}
        </div>

        <div className={styles.ctaBand}>
          <span className="eyebrow">Under tiden</span>
          <h2>Allt du behöver för att komma igång finns redan här — helt gratis.</h2>
          <p>Program, ergonomiguider och min sida är redo att användas idag.</p>
          <Link className="btn btn-primary" href="/">
            Till startsidan
          </Link>
        </div>

        <Footer />
      </div>
    </>
  );
}
