import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogExerciseCard from "@/components/BlogExerciseCard";
import BlogPostCard from "@/components/BlogPostCard";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "../blog-post.module.css";

export const metadata = pageMetadata({
  title: "Ont i nacken — så tränar du bort det — ReAlign Metoden",
  description:
    "Varför nacken gör ont i första hand — vanligast kopplat till stillasittande och hållning, men inte bara det — och fem konkreta övningar som faktiskt gör skillnad.",
  image: "/og/default.png",
  path: "/blogg/ont-i-nacken",
});

export default function BlogPost() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Nacke & hållning</span>
          <h1>Ont i nacken — så tränar du bort det</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <p className={styles.lead}>
            Spänd, stel eller öm nacke är en av de vanligaste sakerna vi
            hör om — vanligast efter långa dagar framför en skärm, men
            långt ifrån bara då. Den goda nyheten: det går nästan alltid
            att träna bort, om man förstår varför den uppstår i första
            hand.
          </p>
        </header>

        <div className={`img-duo warm ${styles.heroImage}`}>
          <Image
            src="https://images.unsplash.com/photo-1723201964235-ea5b99b55d17?auto=format&fit=crop&w=1200&h=700&q=80&sat=-100&con=6&bri=5"
            alt="Person som sitter framåtlutad vid ett skrivbord"
            fill
            sizes="(max-width: 800px) 100vw, 720px"
          />
        </div>

        <div className={styles.article}>
          <h2>Varför gör nacken ont?</h2>
          <p>
            Det handlar sällan om att nacken i sig är svag. Oftast handlar
            det om att nacken har hamnat i en ofrivillig hållningsroll. Vi
            har inga hållningsmuskler i nacken, men dålig hållning gör att
            den måste hålla uppe huvudet enskilt, istället för att hela
            kroppen hjälper till. Stillasittande och dålig sitteknik är
            den vanligaste orsaken, men samma mönster kan uppstå av
            ensidig belastning, mycket mobilanvändning eller stress som
            byggs upp i nacke och axlar.
          </p>

          <div className={styles.perspectiveBox}>
            <span className="eyebrow">Postural träning-perspektivet</span>
            <h2>Det handlar sällan om bara nacken</h2>
            <p>
              Inom postural träning ses nackspänning sällan som ett
              isolerat nackproblem — något man sällan hör i
              vanliga råd om stretching och sittställning. En stel eller
              rundad bröstrygg skjuter fram nacken, och det gör att nacken
              behöver hålla uppe huvudet helt själv. Varje centimeter
              huvudet flyttas framför axlarna ökar belastningen på nacken
              avsevärt. Det är ett bra exempel på att grundorsaken ofta
              sitter längre ner i kedjan än man tror, även om det är
              nacken som faktiskt gör ont.
            </p>
            <p>
              Vid mycket stillasittande går de djupa posturala musklerna
              gradvis in i ett slags vilomodus — de slutar aktiveras som
              de ska. Då tvingas de ytligare musklerna i nacke och axlar
              ta över jobbet, muskler som inte är byggda för att bära den
              belastningen dag efter dag. Det är därför stretching eller
              en bättre stol sällan löser problemet på riktigt — de djupa
              musklerna behöver väckas och tränas upp specifikt, inte bara
              det som gör mest ont.
            </p>
            <p>
              <b>Något som glöms av:</b> bäckenets position är totalt
              avgörande för hur resten av ryggraden beter sig. Ett rundat
              bäcken gör att du har två val — tappa hållningen, eller
              spänna ryggen aktivt för att hålla en ”bra”, men spänd,
              hållning. Även i sittande vill vi ha en naturlig svank,
              eftersom det gör det naturligt för ryggraden att sträcka på
              sig utan att det är påtvingat och spänt. Se mer om det i{" "}
              <Link href="/ergonomi#sitta">sittdelen av vår ergonomiguide</Link>.
            </p>
          </div>

          <h2>Övningar som faktiskt hjälper</h2>
          <ol>
            <li>
              <b>Hakindragningar (chin tucks).</b> Stärker precis de djupa
              halsmusklerna som håller huvudet i rätt läge.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard
                  slug="static-dog-neck-retractions"
                  title="Static Dog Neck Retractions"
                />
              </div>
            </li>
            <li>
              <b>Liggande armpress (goal post press).</b> Aktiverar den
              bakre kedjan i övre rygg och skuldror, samma muskler som
              annars slocknar av framåtlutad sittställning och tvingar
              nacken att kompensera.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard
                  slug="static-back-goal-post-presses"
                  title="Static Back Goal Post Presses"
                />
              </div>
            </li>
            <li>
              <b>Sittande armcirklar.</b> Aktiverar och stärker
              hållningsmusklerna i skulderblad och bröstrygg, så att
              skulderbladen kan ha en bra position. Utan en bra position på
              skulderblad och bröstrygg har nacke och axlar ingen chans att
              ha en bra position.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard
                  slug="sitting-arm-circles"
                  title="Sitting Arm Circles"
                />
              </div>
            </li>
            <li>
              <b>Hals-situps.</b> Kontrollerad styrketräning för halsens
              djupa muskler, inte bara stretching — har du suttit med
              dålig hållning länge är halsens hållningsmuskler med största
              sannolikhet inaktiva.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard
                  slug="hooklying-neck-training"
                  title="Hooklying Neck Training"
                />
              </div>
            </li>
            <li>
              <b>Bröstryggsrörlighet.</b> Stel bröstrygg tvingar nacke och
              axlar att kompensera för rörelser de inte är byggda för. Några
              minuters mobilitetsarbete här avlastar nacken indirekt, till
              exempel:
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="wide-cobra" title="Wide Cobra" />
                <BlogExerciseCard
                  slug="standing-shoulder-rolls"
                  title="Standing Shoulder Rolls"
                />
                <BlogExerciseCard
                  slug="kneeling-table-top-stretch"
                  title="Kneeling Table Top Stretch"
                />
              </div>
            </li>
            <li>
              <b>Regelbundna pauser — inte bara rätt stol.</b> Ingen
              arbetsställning är rätt om du sitter i den i sex timmar rakt
              av. Byt position, variera mellan stående och sittande, och gå
              några steg var 30:e minut.
            </li>
          </ol>

          <div className={styles.ctaBand}>
            <p>
              Vill du ha ett färdigt, ordnat program för just det här —
              istället för att pussla ihop övningar själv?
            </p>
            <Link className="btn btn-primary" href="/program/axlar-nacke-skulderblad-niva-1">
              Testa Axlar/nacke/skulderblad — Nivå 1, gratis →
            </Link>
            <p style={{ fontSize: "0.85rem", marginTop: 14, marginBottom: 0 }}>
              Jobbar du på kontor? Testa vårt{" "}
              <Link href="/program/kontorsvardag">kontorsprogram</Link>.
            </p>
          </div>

          <p>
            Programmet ovan är helt gratis och kräver inget konto för att
            komma igång. Vill du ha hela programbiblioteket, alla
            övningsvideor och progressionsspårning, finns det i{" "}
            <Link href="/premium">Premium</Link>.
          </p>
          <p className={styles.softLink}>
            Om spänningarna sitter i och du vill ha en personlig bedömning
            av var i kedjan grundorsaken sitter, kan ett{" "}
            <Link href="/videosamtal">videosamtal med en av våra terapeuter</Link>{" "}
            vara nästa steg.
          </p>

          <h3 className={styles.relatedHead}>Relaterat</h3>
          <div className={styles.relatedGrid}>
            <BlogPostCard
              slug="ont-i-axeln"
              title="Ont i axeln"
              excerpt="Rundade, framåtdragna axlar — därför uppstår det och vad som bygger upp motståndet."
            />
            <BlogPostCard
              slug="spanningshuvudvark-och-hallning"
              title="Spänningshuvudvärk och hållning"
              excerpt="Finns sambandet mellan nackspänning och huvudvärk som förvärras mot eftermiddagen?"
            />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
