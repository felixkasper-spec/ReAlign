import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogExerciseCard from "@/components/BlogExerciseCard";
import BlogPostCard from "@/components/BlogPostCard";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "../blog-post.module.css";

export const metadata = pageMetadata({
  title: "Ont i axeln — därför uppstår det och vad som hjälper — ReAlign Metoden",
  description:
    "Axelsmärta och stela, framåtdragna axlar hänger ofta ihop med samma grundorsak. Så uppstår det, och så tränar du upp motståndet.",
  image: "/og/default.png",
  path: "/blogg/ont-i-axeln",
});

export default function BlogPost() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Axel & hållning</span>
          <h1>Ont i axeln — därför uppstår det och vad som hjälper</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <p className={styles.lead}>
            Ont i axeln eller axlarna är extremt vanligt. Vanligast
            kopplat till hållning — vid skärmarbete, men lika ofta av
            sport, ensidig belastning i vardagen eller hur man sover.
            Det är sällan något du behöver leva med, men det kräver rätt
            sorts träning, inte bara stretching.
          </p>
        </header>

        <div className={styles.article}>
          <h2>Varför blir axeln spänd, stel eller öm?</h2>
          <p>
            Axeln är sällan svag i sig — oftast handlar det om att den
            fått en framåtdragen, rundad position som den inte är byggd
            för att stå still i över tid. Bröstmusklerna förkortas
            gradvis, medan musklerna mellan skulderbladen — de som ska
            dra axlarna bakåt och hålla dem i rätt position — försvagas
            av att aldrig aktiveras. Skärmarbete är en vanlig orsak, men
            samma mönster uppstår lika lätt av ensidiga rörelser i sport
            eller vardagen, av att bära väska på samma axel, eller av att
            sova mycket på samma sida.
          </p>

          <div className={styles.perspectiveBox}>
            <span className="eyebrow">Postural träning-perspektivet</span>
            <h2>Axeln är ofta bara budbäraren</h2>
            <p>
              Ett perspektiv få tänker på: rundade, spända axlar är inom
              postural träning oftast ett symptom på en stel bröstrygg,
              inte grundorsaken i sig. Bröstryggen (den mellersta delen av
              ryggraden) är designad för rörlighet — när den blir stel
              tvingas axlarna och nacken ta över rörelser de inte är
              gjorda för, vilket driver dem framåt och uppåt och kan bidra
              till allt från spänningsvärk till mer specifika besvär som
              impingement.
            </p>
            <p>
              Precis som i resten av kedjan går de djupa
              hållningsmusklerna kring skulderbladen lätt in i ett slags
              vilomodus när de inte används som de ska — vanligast vid
              mycket stillasittande, men samma sak händer vid ensidig
              belastning över tid. De slutar hålla axlarna på plats.
              Därför räcker det sällan att bara stretcha bröstet eller
              dra ihop skulderbladen ett par gånger; bröstryggens
              rörlighet och skulderbladens djupa stödmuskler behöver
              tränas tillsammans för att axeln ska stanna kvar i rätt
              läge.
            </p>
          </div>

          <p>
            Att bara stretcha bröstet hjälper tillfälligt, men löser
            sällan problemet — det som saknas är styrka i motpartens
            muskler, de som ska hålla axeln på plats. Är smärtan skarp,
            plötslig eller begränsar rörligheten kraftigt, bör du alltid
            få den bedömd av en läkare eller fysioterapeut innan du
            tränar vidare på egen hand.
          </p>

          <h2>Vad som faktiskt bygger upp motståndet</h2>
          <ol>
            <li>
              <b>Axelrullningar.</b> Enkelt att göra flera gånger om dagen,
              motverkar att axlarna gradvis kryper framåt.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="standing-shoulder-rolls" title="Standing Shoulder Rolls" />
              </div>
            </li>
            <li>
              <b>Axellyft (shrugs).</b> Stärker den övre delen av
              skulderbladens stödmuskulatur.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="standing-shoulder-shrugs" title="Standing Shoulder Shrugs" />
              </div>
            </li>
            <li>
              <b>Bröststretch, en arm i taget.</b> Löser upp bröstmusklerna
              som förkortats av en rundad, framåtdragen axelposition.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard
                  slug="standing-one-arm-chest-stretch"
                  title="Standing One Arm Chest Stretch"
                />
              </div>
            </li>
            <li>
              <b>Posturala armhävningar.</b> Bygger styrka genom hela
              axelpartiet med fokus på hållning, inte bara bröstet.
              <div className={styles.exerciseRow}>
                <BlogExerciseCard slug="postural-pushups" title="Postural Pushups" />
              </div>
            </li>
          </ol>

          <p>
            <b>Tänk också på:</b> hur du belastar axlarna även utanför
            skärmarbetet — att bära väska på samma axel dag efter dag,
            sova mycket på samma sida, eller ensidiga rörelser i sport och
            vardag. Skärmhöjden spelar också roll: sitter den för lågt
            lutar du dig framåt hela dagen utan att märka det.
          </p>

          <p>
            Balans i kroppen är inte allt — läs vår{" "}
            <Link href="/ergonomi">ergonomiguide</Link> för konkreta tips
            om hur du kan använda kroppen i vanliga vardagliga situationer,
            som att sitta, stå, lyfta och sova.
          </p>

          <div className={styles.ctaBand}>
            <p>Ett komplett, gratis program för just axlar och skulderblad:</p>
            <Link
              className="btn btn-primary"
              href="/program/axlar-nacke-skulderblad-niva-1"
            >
              Testa Axlar/nacke/skulderblad — Nivå 1, gratis →
            </Link>
          </div>

          <p className={styles.softLink}>
            Vill du veta exakt var i din egen kedja obalansen sitter,
            snarare än att gissa? Ett{" "}
            <Link href="/videosamtal">videosamtal med en av våra terapeuter</Link>{" "}
            ger en personlig bedömning.
          </p>

          <h3 className={styles.relatedHead}>Relaterat</h3>
          <div className={styles.relatedGrid}>
            <BlogPostCard
              slug="ont-i-nacken"
              title="Ont i nacken"
              excerpt="Nacke och axlar hänger ihop via samma kedja — så tränar du bort spänningen."
            />
            <BlogPostCard
              slug="ont-i-ryggen"
              title="Ont i ryggen"
              excerpt="Samma bröstrygg som styr axlarna spelar ofta en stor roll för ryggvärk också."
            />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
