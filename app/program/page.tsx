import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { programMeta } from "@/lib/program-meta";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Program — ReAlign Metoden",
  description:
    "Träningsprogram för hela kroppen, höfter, axlar/nacke, bål, gym och kontorsvardag — flera nivåer, byggda för postural träning.",
  image: "/og/program.png",
});

const CATEGORY_ORDER = [
  "helkropp",
  "hofter",
  "axlar-nacke-skulderblad",
  "kontorsvardag",
  "bal",
  "gym",
];

export default async function ProgramIndexPage() {
  const supabase = await createClient();
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
            nackspänning till hållningskorrigering.
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

        <div className={`${styles.banner} ${styles.bannerFree}`}>
          <div>
            <p>
              <b>Helkropp Nivå 1–2</b>, <b>Nivå 1</b> i övriga kategorier, samt
              Bålträning och Kontorsvardag, är helt gratis. Resten ingår i
              Premium.
            </p>
            <p className={styles.friskvard}>✓ Går att betala med friskvårdsbidrag</p>
          </div>
          <Link className="btn btn-primary" href="/min-sida" style={{ whiteSpace: "nowrap" }}>
            Bli Premium – 149 kr/mån →
          </Link>
        </div>

        <div className={styles.grid} id="programlista">
          {(programs ?? []).map((p) => {
            const meta = programMeta[p.slug];
            return (
              <Link key={p.id} href={`/program/${p.slug}`} className={styles.card}>
                {p.hero_image && (
                  <div className={`img-duo ${styles.cardThumb}`}>
                    <Image
                      src={p.hero_image}
                      alt={p.title}
                      fill
                      sizes="(max-width: 880px) 100vw, 320px"
                    />
                  </div>
                )}
                <div className={styles.cardTop}>
                  <span className={styles.badge}>{meta?.level ?? ""}</span>
                  <span
                    className={`${styles.badge} ${
                      p.tier === "premium" ? styles.premium : styles.free
                    }`}
                  >
                    {p.tier === "premium" ? "Premium" : "Gratis"}
                  </span>
                </div>
                <h3>{p.title}</h3>
                <p className={styles.purpose}>{meta?.purpose}</p>
                <div className={styles.stats}>
                  <span>{meta?.weeks}</span>
                </div>
              </Link>
            );
          })}
        </div>

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
