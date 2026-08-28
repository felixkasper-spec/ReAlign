import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogExerciseCard from "@/components/BlogExerciseCard";
import BlogPostCard from "@/components/BlogPostCard";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "../blog-post.module.css";

export const metadata = pageMetadata({
  title: "Ont i ländryggen — vanligaste orsakerna och vad som hjälper — ReAlign Metoden",
  description:
    "Ländryggens ytliga muskler har ofta fått en hållningsroll de inte är byggda för. Varför det händer, och vilka övningar som faktiskt bygger upp rätt stöd.",
  image: "/og/default.png",
  path: "/blogg/ont-i-landryggen",
});

export default function BlogPost() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Ländrygg & hållning</span>
          <h1>Ont i ländryggen — vanligaste orsakerna och vad som hjälper</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <p className={styles.lead}>
            En dov värk i nedre ryggen är en av de vanligaste anledningarna
            till att människor söker hjälp. Det handlar sällan om att
            ländryggen i sig är svag — snarare att den fått en roll den
            inte är byggd för. Här är vad som faktiskt ligger bakom det,
            och vad som hjälper.
          </p>
        </header>

        <div className={`img-duo warm ${styles.heroImage}`}>
          <Image
            src="https://images.unsplash.com/photo-1769029271190-36b22f5e6771?auto=format&fit=crop&w=1200&h=700&q=80&sat=-100&con=6&bri=5"
            alt="Person som håller sig i nedre ryggen av smärta"
            fill
            sizes="(max-width: 800px) 100vw, 720px"
          />
        </div>

        <div className={styles.article}>
          <h2>Varför gör ländryggen ont?</h2>
          <p>
            Ländryggens ytliga muskler är inte hållningsmuskler — men det
            är precis den rollen de ofta tvingas in i. Det händer när
            andra delar av kroppen inte gör sitt jobb som de ska, vilket
            gör att ländryggen får kompensera dag efter dag, till den
            grad att den blir kroniskt överbelastad.
          </p>

          <div className={styles.perspectiveBox}>
            <span className="eyebrow">Postural träning-perspektivet</span>
            <h2>Ländryggen är sällan grundorsaken — bara där det märks</h2>
            <p>
              Den vanligaste anledningen är att de djupa hållningsmusklerna
              i höft och ljumske inte gör sitt jobb som de ska. De håller
              då inte bäcken och ländrygg i rätt position, vilket tvingar
              ländryggens ytliga muskler att kompensera för att hålla uppe
              överkroppen. Det är därför det sällan blir en hållbar
              förbättring av att bara träna upp ländryggen i sig — den är
              redan överbelastad. Lösningen är inte att stärka den
              ytterligare för att klara belastningen, utan att ta bort
              själva anledningen till att den är överbelastad: få de djupa
              hållningsmusklerna i höft och ljumske att ta över igen.
            </p>
            <p>
              Ett annat vanligt problem är en krum, stel bröstrygg
              tillsammans med ett framåtskjutet huvud. Det är lätt att
              glömma att ryggraden är en sammanhängande enhet, även om vi
              delar in den i ländrygg, mellanrygg och bröstrygg som
              separata delar — obalanser i en del påverkar självklart
              hela ryggraden. En stel bröstrygg och ett framskjutet huvud
              sätter ländryggen i ett onaturligt läge, vilket förstärker
              samma överbelastning underifrån. Läs mer om den kopplingen i{" "}
              <Link href="/blogg/ont-i-ryggen">vår artikel om ont i ryggen</Link>.
            </p>
          </div>

          <p>
            Två saker brukar hjälpa mest: aktivera de djupa
            hållningsmusklerna i höft och ljumske så att de kan ta
            tillbaka sin roll, och frigöra rörligheten i övre delen av
            ryggen så att den slutar belasta ländryggen underifrån.
          </p>

          <h2>Övningar som bygger upp stödet</h2>
          <ol>
            <li>
              <b>Hooklying knee squeezes.</b> Aktiverar de djupa
              hållningsmusklerna i höft och ljumske, som ska hålla bäckenet
              i rätt position.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard
                  slug="hooklying-knee-squeezes"
                  title="Hooklying Knee Squeezes"
                />
              </div>
            </li>
            <li>
              <b>Hooklying single hip lifts.</b> Bygger vidare på samma
              aktivering, med fokus på att styra bäckenet stabilt genom
              rörelsen.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard
                  slug="hooklying-single-hip-lifts"
                  title="Hooklying Single Hip Lifts"
                />
              </div>
            </li>
            <li>
              <b>Supine foot circles.</b> Kopplar in fot och höft
              tillsammans, så att aktiveringen sprider sig genom hela
              kedjan underifrån.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard
                  slug="supine-foot-circles"
                  title="Supine Foot Circles"
                />
              </div>
            </li>
            <li>
              <b>Wide cobra.</b> Rör upp rörligheten i bröstryggen, som
              annars tvingar ländryggen att kompensera för dess stelhet.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="wide-cobra" title="Wide Cobra" />
              </div>
            </li>
            <li>
              <b>Standing shoulder shrugs.</b> Motverkar den framåtskjutna
              huvud- och axelposition som sätter hela ryggraden, ländryggen
              inkluderad, i ett onaturligt läge.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard
                  slug="standing-shoulder-shrugs"
                  title="Standing Shoulder Shrugs"
                />
              </div>
            </li>
            <li>
              <b>Regelbunden rörelse.</b> Oavsett vad som ligger bakom
              överbelastningen hjälper det att röra på sig och variera
              position genom dagen — kroppen är inte gjord för att stå
              still i en enda position, oavsett vilken.
            </li>
          </ol>

          <div className={styles.ctaBand}>
            <p>Ett ordnat program för höft och ländrygg, helt gratis:</p>
            <Link className="btn btn-primary" href="/program/hofter-niva-1">
              Testa Höft & ländrygg — Nivå 1, gratis →
            </Link>
            <p style={{ fontSize: "0.85rem", marginTop: 14, marginBottom: 4 }}>
              Redo för nästa steg?{" "}
              <Link href="/program/hofter-niva-2">Höft & ländrygg — Nivå 2</Link>.
            </p>
            <p style={{ fontSize: "0.85rem", marginTop: 0, marginBottom: 0 }}>
              Jobbar du på kontor? Testa vårt{" "}
              <Link href="/program/kontorsvardag">kontorsprogram</Link>.
            </p>
          </div>

          <p className={styles.softLink}>
            Om värken är återkommande och du vill förstå var i kedjan din
            egen obalans sitter, kan ett{" "}
            <Link href="/videosamtal">videosamtal med en av våra terapeuter</Link>{" "}
            ge en tydligare bild än att gissa själv.
          </p>

          <h3 className={styles.relatedHead}>Relaterat</h3>
          <div className={styles.relatedGrid}>
            <BlogPostCard
              slug="ont-i-ryggen"
              title="Ont i ryggen"
              excerpt="Ländryggen är ofta bara där det märks — så hänger bröstrygg och resten av kedjan ihop med ryggvärk."
            />
            <BlogPostCard
              slug="ont-i-nacken"
              title="Ont i nacken"
              excerpt="Nackspänning och ländryggssmärta hänger ofta ihop via samma kedja."
            />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
