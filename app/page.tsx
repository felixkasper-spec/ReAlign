import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VimeoEmbed from "@/components/VimeoEmbed";
import VimeoPoster from "@/components/VimeoPoster";
import ScrollCue from "@/components/ScrollCue";
import { testimonials } from "@/lib/testimonials";
import { pageMetadata } from "@/lib/page-metadata";
import { createClient } from "@/lib/supabase/server";
import { getSubscription } from "@/lib/subscription";
import styles from "./page.module.css";

const TESTIMONIAL_VIDEO_URLS = [
  "https://player.vimeo.com/video/1219363318?h=4447441569&title=0&byline=0&portrait=0",
  "https://player.vimeo.com/video/1219364602?h=4005ecd03e&title=0&byline=0&portrait=0",
];

export const metadata = pageMetadata({
  title: "Startsida — ReAlign Metoden",
  description:
    "Postural träning som återställer kroppens naturliga balans. Program och ergonomiguider, helt gratis att komma igång med.",
  image: "/og/default.png",
  path: "/",
});

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const subscription = user ? await getSubscription() : null;
  const alreadyPremium = subscription?.active;
  const alreadyCoaching = subscription?.active && subscription.plan === "premium_coaching";

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
              <strong>
                När kroppen får tillbaka sin naturliga
                belastningsfördelning försvinner smärtan och stelheten.
              </strong>{" "}
              Ländrygg, mage, säte, nacke — ingen av dessa är till för att
              hålla kroppen i balans. Lär känna musklerna som faktiskt är
              det.
            </p>
            <div className={styles.heroNote}>
              Gratis att komma igång — inget kort, inget konto krävs.
            </div>
            <div className={styles.heroCtas}>
              <Link
                className="btn btn-primary btn-lg"
                href="/program/helkropp-niva-2?langd=kort"
              >
                Testa ett 5-minuters program
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
                Svara på fem korta frågor — få en programrekommendation
                direkt, helt automatiskt.
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
            <Suspense
              fallback={
                <VimeoEmbed src={TESTIMONIAL_VIDEO_URLS[0]} className={styles.videoBox} lazy />
              }
            >
              <VimeoPoster src={TESTIMONIAL_VIDEO_URLS[0]} className={styles.videoBox} lazy />
            </Suspense>
            <Suspense
              fallback={
                <VimeoEmbed src={TESTIMONIAL_VIDEO_URLS[1]} className={styles.videoBox} lazy />
              }
            >
              <VimeoPoster src={TESTIMONIAL_VIDEO_URLS[1]} className={styles.videoBox} lazy />
            </Suspense>
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
                  src="https://images.unsplash.com/photo-1760084081757-6f918c08403b?auto=format&fit=crop&w=600&h=400&q=80&sat=-100&con=6&bri=5"
                  alt="Person som följer ett strukturerat träningsprogram hemma"
                  fill
                  sizes="(max-width: 880px) 100vw, 33vw"
                />
              </div>
              <span className={styles.num}>01</span>
              <h3>Färdiga program</h3>
              <p>
                Strukturerade program för olika syften och nivåer — från
                helkroppsprogram till mer specifika program, som det
                populära kontorsvardagsprogrammet.
              </p>
              <div className={styles.taglist}>
                <span className="tag">Nybörjare</span>
                <span className="tag">Nacke &amp; axlar</span>
                <span className="tag">Rygg</span>
              </div>
            </Link>
            <Link className={styles.card} href="/om-metoden">
              <div className={`img-duo ${styles.cardThumb}`}>
                <Image
                  src="https://images.unsplash.com/photo-1734873477108-6837b02f2b9d?auto=format&fit=crop&w=600&h=400&q=80&sat=-100&con=6&bri=5"
                  alt="Person som står med naturlig, upprätt hållning"
                  fill
                  sizes="(max-width: 880px) 100vw, 33vw"
                />
              </div>
              <span className={styles.num}>02</span>
              <h3>Om Metoden</h3>
              <p>Förstå principerna bakom metoden.</p>
              <div className={styles.taglist}>
                <span className="tag">Postural kedja</span>
                <span className="tag">Grundorsak</span>
                <span className="tag">Optimum-Metoden</span>
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
                <li>Bläddra bland alla program</li>
                <li>Helkropp Nivå 1–2, Nivå 1 i övriga kategorier — helt gratis</li>
                <li>Läs ergonomiguider för sitta, stå och lyfta</li>
              </ul>
            </div>
            <div className={styles.tierCard}>
              <span className="eyebrow">Gratis konto</span>
              <p className={styles.tierPrice}>0 kr</p>
              <ul className={styles.tierList}>
                <li>Allt i &quot;Utan konto&quot;</li>
                <li>Bygg din egen samling av favoritövningar</li>
                <li>Håll koll på din träning — streak, historik och vecka för vecka</li>
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
              <span className={styles.discountBadge}>-50% första månaden</span>
              <p className={styles.tierPriceAlt}>eller 1 341 kr/år — spara 25%</p>
              <ul className={styles.tierList}>
                <li>Allt i &quot;Gratis konto&quot;</li>
                <li>Alla programnivåer, inklusive Postural Gymträning</li>
                <li>Detaljerad progressionsspårning</li>
                <li>Bygg egna program av dina favoritövningar</li>
                <li>Bläddra &amp; sök i hela övningsbanken</li>
                <li>Ladda ner program som PDF</li>
                <li>Veckobrev med tips och uppföljning</li>
              </ul>
              <p className={styles.friskvard}>✓ Ingen bindningstid, avsluta när du vill</p>
              <p className={styles.friskvard}>✓ Går att betala med friskvårdsbidrag</p>
              {alreadyPremium ? (
                <Link className="btn btn-primary" href="/min-sida">
                  Du är redan medlem →
                </Link>
              ) : (
                <Link className="btn btn-primary" href="/premium">
                  Se vad som ingår →
                </Link>
              )}
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
              <p className={styles.friskvard}>✓ Ingen bindningstid, avsluta när du vill</p>
              <p className={styles.friskvard}>✓ Går att betala med friskvårdsbidrag</p>
              <p className={styles.friskvard}>Begränsat antal platser</p>
              {alreadyCoaching ? (
                <Link className="btn btn-ghost" style={{ border: "1px solid var(--line)" }} href="/min-sida/coaching">
                  Till chatten →
                </Link>
              ) : (
                <Link className="btn btn-ghost" style={{ border: "1px solid var(--line)" }} href="/premium-coaching">
                  Läs mer →
                </Link>
              )}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
