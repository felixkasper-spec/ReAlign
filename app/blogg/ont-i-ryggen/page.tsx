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

        <div className={styles.article}>
          <h2>Varför gör ryggen ont?</h2>
          <p>
            Det handlar sällan om att ryggen är svag i sig. Oftast har
            hållningsmusklerna längs ryggraden tappat förmågan att bära
            överkroppen genom dagen, vilket gör att ytligare muskler
            tvingas ta över — och det är ofta de som gör ont, inte
            grundorsaken. Värken kan sitta högt (mellan skulderbladen),
            lågt (ländryggen) eller vandra mellan de två.
          </p>

          <div className={styles.perspectiveBox}>
            <span className="eyebrow">Postural träning-perspektivet</span>
            <h2>Ryggen kompenserar sällan bara för sig själv</h2>
            <p>
              Ett exempel som ofta lyfts inom postural träning: en fot som
              vrids lätt utåt kan få knät att tippa inåt, vilket i sin tur
              påverkar bäckenets position — och därifrån fortplantar sig
              obalansen uppåt genom bröstryggen, ner i axeln och vidare upp
              i nacken. Ryggen sitter mitt i den kedjan, vilket är precis
              varför den så ofta är där obalanser längre bort i kroppen
              till slut märks som smärta.
            </p>
            <p>
              Vid mycket stillasittande går de djupa hållningsmusklerna
              längs ryggraden gradvis in i ett slags vilomodus — de slutar
              aktiveras som de ska. Ytligare muskler tvingas då bära
              belastning de inte är byggda för, dag efter dag. Det är
              därför stretching eller en bättre stol sällan löser
              problemet på riktigt — de djupa musklerna behöver väckas och
              tränas upp specifikt.
            </p>
            <p>
              En del som ofta glöms bort: bröstryggen (mellersta delen av
              ryggraden) är byggd för rörlighet, men blir hos den som
              sitter mycket ofta den styvaste delen av hela ryggraden. När
              den låser sig tvingas både ländrygg och nacke ta över
              rörelser de inte är gjorda för. Läs mer om det specifikt i
              vår artikel om{" "}
              <Link href="/blogg/ont-i-landryggen">ont i ländryggen</Link>{" "}
              eller <Link href="/blogg/ont-i-nacken">ont i nacken</Link>, om
              det är där din värk sitter.
            </p>
          </div>

          <h2>Övningar som faktiskt hjälper</h2>
          <ol>
            <li>
              <b>Bröstryggsrotation med extension.</b> Rör upp rörligheten
              i just den delen av ryggraden som blir stelast av
              stillasittande.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="back-extension-rotation" title="Back Extension with Rotation" />
              </div>
            </li>
            <li>
              <b>Sittande överhuvudextension.</b> Går att göra direkt vid
              skrivbordet, motverkar den framåtböjda position ryggen
              annars fastnar i.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="sitting-overhead-extension" title="Sitting Overhead Extension" />
              </div>
            </li>
            <li>
              <b>Sittande katt-och-hund.</b> Rör ryggraden genom sitt
              rörelseomfång utan att behöva resa sig upp.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="sitting-cats-and-dogs" title="Sitting Cats And Dogs" />
              </div>
            </li>
            <li>
              <b>Postural planka.</b> Bygger upp bålens stöd runt hela
              ryggraden, istället för att bara lindra symptomet där det gör
              ont.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="postural-plank" title="Postural Plank" />
              </div>
            </li>
            <li>
              <b>Regelbundna pauser.</b> Ingen arbetsställning är rätt om du
              sitter i den i sex timmar rakt av. Byt position, variera
              mellan stående och sittande, gå några steg var 30:e minut.
            </li>
          </ol>

          <div className={styles.ctaBand}>
            <p>Ett komplett, gratis program för hela bålen och ryggen:</p>
            <Link className="btn btn-primary" href="/program/baltraning">
              Testa Bålträning, gratis →
            </Link>
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
