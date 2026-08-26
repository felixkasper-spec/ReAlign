import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VimeoEmbed from "@/components/VimeoEmbed";
import ScrollCue from "@/components/ScrollCue";
import { testimonials } from "@/lib/testimonials";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      <Header transparent />
      <div className="wrap">
        <section className={styles.hero}>
          <div>
            <span className="eyebrow">ReAlign · En kropp i balans</span>
            <h1>
              Kroppen är ett system.
              <br />
              Träna den som en <em>helhet</em>.
            </h1>
            <p>
              <strong>Hållningsträning — på riktigt.</strong> Ländrygg, mage,
              säte, nacke — ingen av dessa är till för att hålla uppe
              kroppen. Lär känna musklerna som faktiskt är designade för
              att hålla kroppen i balans.
            </p>
            <div className={styles.heroNote}>
              🎉 Gratis att komma igång — inget kort krävs.
            </div>
            <div className={styles.heroCtas}>
              <Link
                className="btn btn-primary btn-lg"
                href="/program/helkropp-niva-2?langd=kort"
              >
                Testa ett kort program — 5 minuter
              </Link>
              <Link className="btn btn-primary btn-lg" href="/program">
                Se alla program →
              </Link>
            </div>
            <div className={styles.trust}>
              <div>
                <b>Hela kroppen</b>i fokus, inte delar
              </div>
              <div>
                <b>Träning som passar dig</b>oavsett nivå
              </div>
            </div>
          </div>

          <div className={`img-duo ${styles.heroImage}`}>
            <Image
              src="https://images.unsplash.com/photo-1590847330116-ea94fb93eac3?auto=format&fit=crop&w=700&h=900&q=80&sat=-100&con=6&bri=5"
              alt="Person i medelåldern som är aktiv utomhus"
              fill
              sizes="(max-width: 880px) 100vw, 550px"
              priority
            />
          </div>
          <ScrollCue href="#nyfiken" label="Läs mer" className={styles.heroScrollCue} />
        </section>

        <section className={styles.twoWaysSection} style={{ paddingBottom: 44 }} id="nyfiken">
          <div className="section-head" style={{ marginBottom: 22 }}>
            <span className="eyebrow">Nyfiken? Två sätt att börja</span>
          </div>
          <div className={styles.twoWays}>
            <Link
              href="/program/helkropp-niva-2?langd=kort"
              className={`${styles.wayCard} ${styles.sage}`}
            >
              <span className="eyebrow" style={{ color: "var(--warm-soft)" }}>
                Enklast — bara 5 minuter
              </span>
              <h3>Testa ett kort program</h3>
              <p>
                Några utvalda övningar, klart på några minuter. Det snabbaste
                sättet att känna vad hållningsträning faktiskt gör för
                kroppen.
              </p>
              <span className="btn btn-primary">Testa nu →</span>
            </Link>
            <Link href="/analys" className={`${styles.wayCard} ${styles.plain}`}>
              <span className="eyebrow">Mer precist</span>
              <h3>Hitta rätt program</h3>
              <p>
                Svara på fem korta frågor om var det gör ont och din vardag —
                få en programrekommendation direkt, helt automatiskt.
              </p>
              <span className="btn btn-ghost" style={{ border: "1px solid var(--line)" }}>
                Hitta mitt program →
              </span>
            </Link>
          </div>
        </section>

        <section style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className={styles.advisory}>
            <div style={{ maxWidth: 560 }}>
              <span className="eyebrow">Personlig rådgivning</span>
              <h3>Vill du ha ett program skräddarsytt exakt för din kropp?</h3>
              <p>
                Boka en videosamtals-analys med en av våra terapeuter på kliniken. Du får
                inte bara en bedömning — vi bygger ett eget program åt dig
                utifrån vad vi ser.
              </p>
              <p className={styles.advisoryNote}>✓ Går att betala med friskvårdsbidrag</p>
            </div>
            <Link
              className="btn btn-primary"
              href="/videosamtal"
              style={{ whiteSpace: "nowrap" }}
            >
              Boka videosamtals-analys – 590 kr →
            </Link>
          </div>
        </section>

        <section style={{ paddingTop: 88 }}>
          <div className="section-head" style={{ marginBottom: 20 }}>
            <span className="eyebrow">Vad andra säger</span>
            <h2 style={{ marginTop: 10, fontSize: "1.9rem" }}>
              Riktiga resultat, med egna ord.
            </h2>
          </div>

          <div className={styles.googleRating}>
            <span className={styles.stars}>★★★★★</span>
            <span>
              <b>5.0</b> på Google
            </span>
          </div>

          <div className={styles.testimonialGrid}>
            <VimeoEmbed
              src="https://player.vimeo.com/video/1219363318?h=4447441569&title=0&byline=0&portrait=0"
              className={styles.videoBox}
              lazy
            />
            <VimeoEmbed
              src="https://player.vimeo.com/video/1219364602?h=4005ecd03e&title=0&byline=0&portrait=0"
              className={styles.videoBox}
              lazy
            />
            {testimonials.slice(0, 2).map((t) => (
              <div key={t.quote} className={styles.quoteCard}>
                <p>&quot;{t.quote}&quot;</p>
                <p>— Patientrecension</p>
              </div>
            ))}
          </div>

          <div className={styles.testimonialGrid}>
            {testimonials.slice(2).map((t) => (
              <div key={t.quote} className={styles.quoteCard}>
                <p>&quot;{t.quote}&quot;</p>
                <p>— Patientrecension</p>
              </div>
            ))}
          </div>
        </section>

        <section id="program">
          <div className="section-head">
            <span className="eyebrow">Postural Träning</span>
            <h2 style={{ marginTop: 0 }}>
              Metoden är helheten. Men du väljer fokus.
            </h2>
            <p style={{ marginTop: 10 }}>
              Kärnan i allt vi gör är att återställa balans i hela kroppen —
              men du kan alltid välja ett program med extra fokus på en
              specifik del, som nacke, axlar eller höft.
            </p>
          </div>
          <div className={styles.cards3}>
            <Link className={styles.card} href="/program">
              <div className={`img-duo ${styles.cardThumb}`}>
                <Image
                  src="https://images.unsplash.com/photo-1590847330116-ea94fb93eac3?auto=format&fit=crop&w=600&h=400&q=80&sat=-100&con=6&bri=5"
                  alt="Person i medelåldern som är aktiv"
                  fill
                  sizes="(max-width: 880px) 100vw, 33vw"
                />
              </div>
              <span className={styles.num}>01</span>
              <h3>Färdiga program</h3>
              <p>
                Strukturerade program för olika syften och nivåer — från
                nackspänning till hållningskorrigering.
              </p>
              <div className={styles.taglist}>
                <span className="tag">Nybörjare</span>
                <span className="tag">Nacke &amp; axlar</span>
                <span className="tag">Rygg</span>
              </div>
            </Link>
            <Link className={styles.card} href="/ovningsbank">
              <div className={`img-duo ${styles.cardThumb}`}>
                <Image
                  src="https://images.unsplash.com/photo-1701826510656-8dbcec14a4b5?auto=format&fit=crop&w=600&h=400&q=80&sat=-100&con=6&bri=5"
                  alt="Person i medelåldern som utför en övning"
                  fill
                  sizes="(max-width: 880px) 100vw, 33vw"
                />
              </div>
              <span className={styles.num}>02</span>
              <h3>Övningsbank</h3>
              <p>
                Alla övningar var för sig, filtrerbara på kroppsdel,
                utrustning och svårighetsgrad.
              </p>
              <div className={styles.taglist}>
                <span className="tag">Video</span>
                <span className="tag">Kategoriserat</span>
                <span className="tag">Favoriter</span>
              </div>
            </Link>
            <Link className={styles.card} href="/ergonomi">
              <div className={`img-duo warm ${styles.cardThumb}`}>
                <Image
                  src="https://images.unsplash.com/photo-1713946598456-a25ab3645730?auto=format&fit=crop&w=600&h=400&q=80&sat=-100&con=6&bri=5"
                  alt="Person som stretchar vid skrivbordet"
                  fill
                  sizes="(max-width: 880px) 100vw, 33vw"
                />
              </div>
              <span className={styles.num}>03</span>
              <h3>Ergonomi i vardagen</h3>
              <p>
                Så sitter, står och lyfter du rätt — på kontoret, hemma och
                i vardagens rörelser.
              </p>
              <div className={styles.taglist}>
                <span className="tag">Sitta</span>
                <span className="tag">Lyfta</span>
                <span className="tag">Stå</span>
              </div>
            </Link>
          </div>
        </section>

        <section>
          <div className={styles.minsida}>
            <div>
              <span className="eyebrow">Min sida</span>
              <h2>Din träning, samlad.</h2>
              <p>Logga pass, schemalägg veckan och spara dina favoritövningar.</p>
              <div className={styles.feat}>
                <span className={styles.dot2} />
                Schemalägg pass och håll koll på veckan
              </div>
              <div className={styles.feat}>
                <span className={styles.dot2} />
                Spara favoritövningar för snabb åtkomst
              </div>
              <div className={styles.feat}>
                <span className={styles.dot2} />
                Bygg egna program från övningsbanken
              </div>
              <div className={styles.feat}>
                <span className={styles.dot2} />
                Följ din utveckling över tid
              </div>
            </div>
            <div className={styles.dash}>
              <div className={styles.dashRow}>
                <span>Morgonrutin — ländrygg</span>
                <span className={`${styles.status} ${styles.done}`}>Klar</span>
              </div>
              <div className={styles.dashRow}>
                <span>Höftmobilitet, nivå 2</span>
                <span className={styles.status}>Idag 17:00</span>
              </div>
              <div className={styles.dashRow}>
                <span>På jobbet: Skrivbordspaus</span>
                <span className={styles.status}>3 övningar</span>
              </div>
              <div className={styles.dashRow}>
                <span>Ergonomicheck: Sittställning</span>
                <span className={`${styles.status} ${styles.done}`}>Klar</span>
              </div>
            </div>
          </div>
        </section>

        <section style={{ paddingTop: 0, paddingBottom: 20 }}>
          <Link href="/kommer-snart" className={styles.upcoming}>
            <div>
              <span className="eyebrow">På gång</span>
              <p>
                Community-forum, veckobrev, gruppträning via video,
                hållnings- och funktionsanalys, webb-butik med mera
              </p>
            </div>
            <span
              className="btn btn-ghost"
              style={{ border: "1px solid var(--line)", whiteSpace: "nowrap" }}
            >
              Se vad som kommer →
            </span>
          </Link>
        </section>

        <section id="priser">
          <div className="section-head" style={{ textAlign: "center", margin: "0 auto 40px" }}>
            <span className="eyebrow">Priser</span>
            <h2 style={{ marginTop: 10 }}>Vad ingår på varje nivå.</h2>
            <p style={{ marginTop: 10, color: "var(--text-soft)" }}>
              Du kommer långt utan att ens skapa konto — och det mesta
              förblir gratis även med ett.
            </p>
          </div>
          <div className={styles.tierGrid}>
            <div className={styles.tierCard}>
              <span className="eyebrow">Utan konto</span>
              <p className={styles.tierPrice}>0 kr</p>
              <ul className={styles.tierList}>
                <li>Bläddra bland alla program &amp; övningar</li>
                <li>Helkropp Nivå 1–2, Nivå 1 i övriga kategorier — helt gratis</li>
                <li>Läs ergonomiguider för sitta, stå och lyfta</li>
              </ul>
            </div>
            <div className={styles.tierCard}>
              <span className="eyebrow">Gratis konto</span>
              <p className={styles.tierPrice}>0 kr</p>
              <ul className={styles.tierList}>
                <li>Allt i &quot;Utan konto&quot;</li>
                <li>Spara favoritövningar</li>
                <li>Schemalägg och logga dina träningspass</li>
              </ul>
              <Link className="btn btn-ghost" style={{ border: "1px solid var(--line)" }} href="/signup">
                Skapa gratis konto
              </Link>
            </div>
            <div className={`${styles.tierCard} ${styles.tierHighlight}`}>
              <span className="eyebrow" style={{ color: "var(--warm-soft)" }}>
                Premium
              </span>
              <p className={styles.tierPrice}>149 kr/mån</p>
              <ul className={styles.tierList}>
                <li>Allt i &quot;Gratis konto&quot;</li>
                <li>Alla programnivåer, inklusive Gymträning</li>
                <li>Bygg egna program av dina favoritövningar</li>
                <li>Alla övningsvideor i övningsbanken</li>
                <li>Ladda ner program som PDF</li>
                <li>Detaljerad progressionsspårning</li>
                <li>Veckobrev med tips och uppföljning</li>
              </ul>
              <Link className="btn btn-primary" href="/premium">
                Se vad som ingår →
              </Link>
              <p className={styles.friskvard}>✓ Ingen bindningstid, avsluta när du vill</p>
              <p className={styles.friskvard}>✓ Går att betala med friskvårdsbidrag</p>
            </div>
            <div className={styles.tierCard}>
              <span className="eyebrow" style={{ color: "var(--warm)" }}>
                Premium Coaching
              </span>
              <p className={styles.tierPrice}>449 kr/mån</p>
              <ul className={styles.tierList}>
                <li>Allt i &quot;Premium&quot;</li>
                <li>Direktkontakt med en coach via chatt</li>
                <li>Svar på frågor om övningar och upplägg</li>
                <li>Svar inom 1–2 vardagar</li>
              </ul>
              <Link className="btn btn-ghost" style={{ border: "1px solid var(--line)" }} href="/premium-coaching">
                Läs mer →
              </Link>
              <p className={styles.friskvard}>✓ Ingen bindningstid, avsluta när du vill</p>
              <p className={styles.friskvard}>✓ Går att betala med friskvårdsbidrag</p>
              <p className={styles.friskvard}>Begränsat antal platser</p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
