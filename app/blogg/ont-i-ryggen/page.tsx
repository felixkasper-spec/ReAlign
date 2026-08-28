import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogExerciseCard from "@/components/BlogExerciseCard";
import BlogPostCard from "@/components/BlogPostCard";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "../blog-post.module.css";

export const metadata = pageMetadata({
  title: "Ont i ryggen — vanligaste orsakerna och vad som hjälper — ReAlign Metoden",
  description:
    "Ryggsmärta sitter sällan bara i ryggen. Så hänger bröstrygg, bäcken och resten av kroppen ihop med ryggvärk, och vilka övningar som faktiskt hjälper.",
  image: "/og/default.png",
  path: "/blogg/ont-i-ryggen",
});

export default function BlogPost() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Rygg & hållning</span>
          <h1>Ont i ryggen — vanligaste orsakerna och vad som hjälper</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <p className={styles.lead}>
            Ryggvärk är en av de vanligaste anledningarna till att människor
            söker hjälp — oavsett om det sitter högt mellan skulderbladen
            eller lågt i ländryggen. Här är vad som faktiskt brukar ligga
            bakom det, och vad som hjälper.
          </p>
        </header>

        <div className={`img-duo warm ${styles.heroImage}`}>
          <Image
            src="https://images.unsplash.com/photo-1769029271190-36b22f5e6771?auto=format&fit=crop&w=1200&h=440&q=80&sat=-100&con=6&bri=5"
            alt="Person som håller sig om nedre ryggen av smärta"
            fill
            sizes="(max-width: 800px) 100vw, 720px"
          />
        </div>

        <div className={styles.article}>
          <nav className={styles.toc} aria-label="Innehåll i artikeln">
            <span className={styles.tocLabel}>I den här artikeln</span>
            <div className={styles.tocLinks}>
              <a href="#varfor">Varför gör det ont?</a>
              <a href="#ovningar">Övningar som hjälper</a>
              <a href="#ergonomi">Ergonomi & vardagstips</a>
            </div>
          </nav>

          <h2 id="varfor">Varför gör ryggen ont?</h2>
          <p>
            Precis som nästan alla delar av kroppen handlar det om två
            saker: positionering och belastningsfördelning. Det allra
            vanligaste vi har sett på kliniken är att ryggen har för lite
            svank, för mycket svank, eller att man är för krum i
            bröstryggen.
          </p>
          <p>
            Det leder, utan undantag, till felbelastning — någon del kan
            inte göra sitt jobb, en annan del får ta över arbetet. Det är
            mest relevant om du inte bara har ont i ryggen, utan också
            känner dig konstant trött i ryggen. Då vet vi att din rygg
            aldrig får vila. I sittande, stående och gående ska ryggen
            kännas lättsam och mjuk, men om muskler som inte är till för
            att hålla uppe ryggen har fått den uppgiften känns det tungt
            och stelt — och gör det, om det får pågå länge nog, till slut
            ont.
          </p>

          <div className={styles.perspectiveBox}>
            <span className="eyebrow">Postural träning-perspektivet</span>
            <h2>Ryggen är expert på att ta för mycket ansvar</h2>
            <p>
              <b>Ländrygg:</b> en av de allra vanligaste obalanserna vi ser
              är att ytliga ländryggsmuskler har fått en hållningsroll.
              Dessa är inte hållningsmuskler, utan är gjorda för mer
              kortvarig belastning. När de konstant behöver hålla uppe
              kroppen blir det, som nämnt, tungt, stelt och ofta även
              smärtsamt. Vad ska hålla ländryggen i position då? Framför
              allt är det hållningsmusklerna djupt inne i höften som ska
              hålla uppe ländryggen, genom att sätta bäckenet i ett
              neutralt läge som gör att ländryggen inte behöver arbeta så
              mycket. Värt att nämna är att den viktigaste
              hållningsmuskeln av dem alla — psoasmuskeln — räknas som en
              höftböjare men går upp i ländryggen, och hjälper de andra
              höftmusklerna att hålla ryggraden rak. Den vill vi gärna
              använda, men när vi känner oss konstant trötta och stela i
              ländryggen är det generellt de mer ytliga
              ländryggsmusklerna vi använder istället.
            </p>
            <p>
              <b>Bröstryggen/skulderbladen:</b> vanligast i bröstryggen är
              tydligt — skulderblad som ”fallit ut” uppåt och åt sidorna,
              axlar som roterats framåt, och en huvudposition som är
              framskjuten. Det gör dig ”framtung”, vilket innebär att
              bröstryggens muskulatur konstant måste hålla emot det
              mönstret. De hamnar i ett konstant ”dragläge” då de måste
              hålla tillbaka mot de delar som tappat position.
            </p>
            <p>
              Det är inte konstigt att tro att en upprätt hållning skulle
              vara jobbigare för musklerna i området — då måste de ju
              jobba ännu mer för att dra bak skulderblad och axlar — men
              det är inte fallet. När vi hamnar i rätt positioner behöver
              ingen del överarbeta, eftersom kroppens alla delar staplas
              på varandra och hjälper varandra. Har vi tappat position i
              skulderblad, nacke eller axlar behöver vi kompensera för
              det; är vi i balans behöver bröstrygg- och
              skulderbladsmuskulaturen bara göra exakt det arbete den är
              tänkt för. Därför behöver vi stärka just hållningsmusklerna
              i övre ryggen, så att området kan komma tillbaka i rätt
              position och de ytliga musklerna kan slappna av.
            </p>
          </div>

          <h2 id="ovningar">Övningar som faktiskt hjälper</h2>

          <h3>Bröstrygg</h3>
          <ol>
            <li>
              <b>Static back goal post presses.</b> Bra kombination av att
              aktivera hållningsmusklerna runt skulderbladen samtidigt som
              axeln får jobba på att roteras tillbaka.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard
                  slug="static-back-goal-post-presses"
                  title="Static Back Goal Post Presses"
                />
              </div>
            </li>
            <li>
              <b>Standing arm circles.</b> Aktiverar och stärker musklerna
              som håller bak och ner skulderbladen.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="standing-arm-circles" title="Standing Arm Circles" />
              </div>
            </li>
            <li>
              <b>Static dog neck retractions.</b> Aktiverar
              hållningsmusklerna i halsen så att huvudet får en bättre
              position och avlastar bröstryggen.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard
                  slug="static-dog-neck-retractions"
                  title="Static Dog Neck Retractions"
                />
              </div>
            </li>
          </ol>

          <h3>Ländrygg</h3>
          <ol>
            <li>
              <b>Sitting knee squeezes.</b> Aktiverar och stärker de djupa
              höftmusklerna samt lär rygg och bäcken att jobba i harmoni
              igen.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="sitting-knee-squeezes" title="Sitting Knee Squeezes" />
              </div>
            </li>
            <li>
              <b>Sitting single hip lifts.</b> Liknande sitting knee
              squeezes, fast mer specifikt inriktad mot psoasmuskeln, som
              är muskeln med störst ansvar för att hålla bäcken och
              ländrygg i sin naturliga position.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="sitting-single-hip-lifts" title="Sitting Single Hip Lifts" />
              </div>
            </li>
            <li>
              <b>Sittande katt-och-hund.</b> Öppnar upp stelheter kring
              ryggraden, samt lär rygg och bäcken att börja jobba i
              harmoni igen.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="sitting-cats-and-dogs" title="Sitting Cats And Dogs" />
              </div>
            </li>
          </ol>

          <p id="ergonomi">
            <b>Tänk också på:</b> om du har kontorsjobb, eller lyfter
            mycket i ditt yrke, är även ergonomi A och O. Se vår{" "}
            <Link href="/ergonomi">ergonomiguide</Link> för konkreta tips
            och videoinstruktioner.
          </p>

          <div className={styles.ctaBand}>
            <p>Ett komplett, gratis program för hela bålen och ryggen:</p>
            <Link className="btn btn-primary" href="/program/baltraning">
              Testa Bålträning, gratis →
            </Link>
            <p style={{ fontSize: "0.85rem", marginTop: 14, marginBottom: 0 }}>
              Misstänker du att obalanserna är bredare än bara ryggen? Då
              är <Link href="/program/helkropp-niva-2">Helkropp — Nivå 2</Link>{" "}
              programmet för dig.
            </p>
          </div>

          <p className={styles.softLink}>
            Om värken är återkommande och du vill förstå var i kedjan din
            egen obalans faktiskt sitter, kan ett{" "}
            <Link href="/videosamtal">videosamtal med en av våra terapeuter</Link>{" "}
            ge en tydligare bild än att gissa själv.
          </p>

          <h3 className={styles.relatedHead}>Relaterat</h3>
          <div className={styles.relatedGrid}>
            <BlogPostCard
              slug="ont-i-landryggen"
              title="Ont i ländryggen"
              excerpt="Vanligaste orsakerna till att just nedre ryggen gör ont, och vilka övningar som bygger upp stödet."
            />
            <BlogPostCard
              slug="ont-i-nacken"
              title="Ont i nacken"
              excerpt="Samma kedja, ett annat ställe där obalansen märks — så tränar du bort nackspänningen."
            />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
