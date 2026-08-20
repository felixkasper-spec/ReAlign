import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

const testimonials = [
  {
    quote:
      "Har haft ont i ryggen länge och äntligen har jag hittat en träningsform där man jobbar på hela kroppen samt orsak för problemet. Smärtan i ryggen släppte efter bara 1h och nu vet jag även vad smärtan berodde på! Tack!",
  },
  {
    quote:
      "Efter att ha haft smärta i nacke/axel i nästan 20 år, så känner jag nu efter bara 4 veckors träning nästan inga besvär alls.",
  },
  {
    quote:
      "Fått jättebra resultat med min axel som jag haft ont i länge. Värken är borta och rörligheten är mycket bättre.",
  },
  {
    quote:
      "Efter bara en dryg vecka med övningarna märkte jag jätteskillnad på kroppen och smärtan som jag haft i höften försvann nästan helt.",
  },
];

export default function Home() {
  return (
    <>
      <Header />
      <div className="wrap">
        <section className={styles.hero}>
          <div>
            <span className="eyebrow">Helkroppsbalans · inte symptomjakt</span>
            <h1>
              Kroppen är ett system.
              <br />
              Träna den som en <em>helhet</em>.
            </h1>
            <p>
              <strong>Hållningsträning — på riktigt.</strong> Ländrygg, mage,
              säte, nacke — ingen av dessa är till för att hålla uppe
              kroppen. Lär känna musklerna som faktiskt är designade för
              hållning.
            </p>
            <div className={styles.heroNote}>
              🎉 Helt gratis — inga betalplaner, bara träning.
            </div>
            <div className={styles.heroCtas}>
              <Link className="btn btn-primary btn-lg" href="/program">
                Se alla program →
              </Link>
              <Link
                className="btn btn-ghost btn-lg"
                href="/program/helkropp-niva-1?langd=kort"
              >
                Testa ett kort program — 5 min
              </Link>
            </div>
            <div className={styles.trust}>
              <div>
                <b>Helkropp</b>i fokus, inte delar
              </div>
              <div>
                <b>120+</b>övningar
              </div>
              <div>
                <b>Träning som passar dig</b>oavsett nivå
              </div>
            </div>
          </div>

          <div className={`img-duo ${styles.heroImage}`}>
            <Image
              src="https://images.unsplash.com/photo-1590847330116-ea94fb93eac3?auto=format&fit=crop&w=700&h=900&q=80"
              alt="Person i medelåldern som är aktiv utomhus"
              fill
              sizes="(max-width: 880px) 100vw, 550px"
              priority
            />
          </div>
        </section>

        <section style={{ paddingTop: 0, paddingBottom: 44 }}>
          <div className="section-head" style={{ marginBottom: 22 }}>
            <span className="eyebrow">Nyfiken? Två sätt att börja</span>
          </div>
          <div className={styles.twoWays}>
            <Link
              href="/program/helkropp-niva-1?langd=kort"
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
              <div className={styles.wayCardTop}>
                <span className="eyebrow">Mer precist</span>
                <span className={styles.badgeSoon}>Kommer snart</span>
              </div>
              <h3>Analysera din kropp</h3>
              <p>
                Enkla och tydliga tester för att se var din kropp bär sina
                obalanser — och vilka övningar som passar just dig.
              </p>
              <span className="btn btn-ghost" style={{ border: "1px solid var(--line)" }}>
                Se förhandsvisning →
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
                Boka en videosamtals-analys med en av våra kliniker. Du får
                inte bara en bedömning — vi bygger ett eget program åt dig
                utifrån vad vi ser.
              </p>
            </div>
            <Link
              className="btn btn-primary"
              href="/analys"
              style={{ whiteSpace: "nowrap" }}
            >
              Boka videosamtals-analys →
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

          <a
            href="https://g.page/r/CZwRJa9X-cYqEBM/review"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.googleRating}
          >
            <span className={styles.stars}>★★★★★</span>
            <span>
              <b>5.0</b> på Google · baserat på recensioner från våra
              patienter
            </span>
            <span style={{ color: "var(--sage)" }}>→</span>
          </a>

          <div className={styles.testimonialGrid}>
            <div className={styles.videoBox}>
              <iframe
                src="https://player.vimeo.com/video/1219363318?h=4447441569&title=0&byline=0&portrait=0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className={styles.videoBox}>
              <iframe
                src="https://player.vimeo.com/video/1219364602?h=4005ecd03e&title=0&byline=0&portrait=0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
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

        <section style={{ paddingTop: 0 }}>
          <div className={styles.photoBand}>
            <div className={`img-duo ${styles.bandImage}`}>
              <Image
                src="https://images.unsplash.com/photo-1701826510656-8dbcec14a4b5?auto=format&fit=crop&w=900&h=700&q=80"
                alt="Person i medelåldern som stretchar hemma"
                fill
                sizes="(max-width: 880px) 100vw, 33vw"
              />
            </div>
            <div className={`img-duo warm ${styles.bandImage}`}>
              <Image
                src="https://images.unsplash.com/photo-1718862403436-616232ec6005?auto=format&fit=crop&w=600&h=700&q=80"
                alt="Person i medelåldern med yogamatta"
                fill
                sizes="(max-width: 880px) 100vw, 33vw"
              />
            </div>
            <div className={`img-duo ${styles.bandImage}`}>
              <Image
                src="https://images.unsplash.com/photo-1764173040171-57f79264b358?auto=format&fit=crop&w=600&h=700&q=80"
                alt="Person i medelåldern som tränar"
                fill
                sizes="(max-width: 880px) 100vw, 33vw"
              />
            </div>
            <div className={styles.bandCaption}>
              <span className="eyebrow">Verklig rörelse</span>
              <p>
                Bilder byts ut mot riktigt material från kliniken och
                ReAlign-appen när sidan byggs på riktigt.
              </p>
            </div>
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
                  src="https://images.unsplash.com/photo-1590847330116-ea94fb93eac3?auto=format&fit=crop&w=600&h=400&q=80"
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
                  src="https://images.unsplash.com/photo-1701826510656-8dbcec14a4b5?auto=format&fit=crop&w=600&h=400&q=80"
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
                  src="https://images.unsplash.com/photo-1713946598456-a25ab3645730?auto=format&fit=crop&w=600&h=400&q=80"
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
                Schemalagd träning med påminnelser
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
          <div className={styles.pricingBox}>
            <span className="eyebrow">Priser</span>
            <h2>Helt gratis att använda.</h2>
            <p>
              Program, övningsbank, ergonomiguider och min sida — allt
              ingår, ingen betalning krävs. Vi lägger till fler funktioner
              löpande, och kommer vara tydliga innan något någonsin blir
              betalt.
            </p>
            <Link className="btn btn-primary btn-lg" href="/min-sida">
              Kom igång gratis
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
