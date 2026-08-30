import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import { pageMetadata } from "@/lib/page-metadata";
import ProgramFilter from "./ProgramFilter";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Program — ReAlign Metoden",
  description:
    "Träningsprogram för hela kroppen, höfter, axlar/nacke, bål, gym och kontorsvardag — flera nivåer, byggda för postural träning.",
  image: "/og/program.png",
  path: "/program",
});

const CATEGORY_ORDER = [
  "helkropp",
  "hofter",
  "rorlighet-hofter",
  "axlar-nacke-skulderblad",
  "rorlighet-axlar",
  "kontorsvardag",
  "bal",
  "gym",
];

export default async function ProgramIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const subscription = user ? await getSubscription() : null;
  const alreadyPremium = subscription?.active;

  const { data } = await supabase
    .from("programs")
    .select("id, slug, title, tier, hero_image, category, level");

  const programs = [...(data ?? [])].sort((a, b) => {
    const catA = CATEGORY_ORDER.indexOf(a.category);
    const catB = CATEGORY_ORDER.indexOf(b.category);
    if (catA !== catB) return catA - catB;
    return (a.level ?? 0) - (b.level ?? 0);
  });

  return (
    <>
      <Header />
      <div className="wrap">
        <div className={styles.pageHead}>
          <span className="eyebrow">Program</span>
          <h1 className={styles.title}>Hitta ditt program.</h1>
          <p className={styles.intro}>
            Strukturerade program för olika syften och nivåer — från
            helkroppsprogram till mer specifika program, bläddra fritt i
            programmen nedan.
          </p>
          <Link
            href="#programlista"
            className={`btn btn-ghost ${styles.jumpBtn}`}
            style={{ border: "1px solid var(--line)" }}
          >
            Till programmen →
          </Link>
        </div>

        <div className={styles.banner}>
          <p>Osäker på vilket program som passar dig? Svara på fem korta frågor.</p>
          <Link className="btn btn-primary" href="/analys" style={{ whiteSpace: "nowrap" }}>
            Hitta mitt program →
          </Link>
        </div>

        {!alreadyPremium && (
          <div className={`${styles.banner} ${styles.bannerFree}`}>
            <div>
              <p>
                <b>Helkropp Nivå 1–2</b>, <b>Nivå 1</b> i övriga kategorier, samt
                Bålträning och Kontorsvardag, är helt gratis. Resten ingår i
                Premium — 149 kr/mån, eller 1 341 kr/år (spara 25%).
              </p>
              <p className={styles.friskvard}>✓ Går att betala med friskvårdsbidrag</p>
            </div>
            <Link className="btn btn-primary" href="/premium" style={{ whiteSpace: "nowrap" }}>
              Läs mer om Premium →
            </Link>
          </div>
        )}

        <ProgramFilter programs={programs} />

        <div className={styles.ctaBanner}>
          <div style={{ maxWidth: 600 }}>
            <span className="eyebrow">Hittar du inte rätt program?</span>
            <h3 style={{ fontSize: "1.2rem", margin: "8px 0 8px", fontWeight: 500 }}>
              Låt oss bygga ett åt dig
            </h3>
            <p style={{ color: "var(--text-soft)", fontSize: "0.9rem" }}>
              Boka en videosamtals-analys med en av våra terapeuter på kliniken. Vi går
              igenom din kropp tillsammans och bygger sedan ett eget program
              utifrån vad vi ser — helt skräddarsytt för dig.
            </p>
            <p className={styles.friskvard}>✓ Går att betala med friskvårdsbidrag</p>
          </div>
          <Link
            className="btn btn-primary"
            href="/videosamtal"
            style={{ whiteSpace: "nowrap" }}
          >
            Boka videosamtals-analys – 590 kr →
          </Link>
        </div>

        <Footer />
      </div>
    </>
  );
}
