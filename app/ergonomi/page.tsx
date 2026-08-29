import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpotifyEmbed from "@/components/SpotifyEmbed";
import VimeoEmbed from "@/components/VimeoEmbed";
import { getSpotifyOembed } from "@/lib/spotify";
import { getVimeoThumbnail } from "@/lib/vimeo-thumbnail";
import { pageMetadata } from "@/lib/page-metadata";
import JumpNav from "./JumpNav";
import styles from "./page.module.css";

const EPISODE_ID = "6T3rxc52NXbu0zL4yoE2Cq";
const INTRO_VIDEO_URL =
  "https://player.vimeo.com/video/1218399844?h=9a6c3bce96&title=0&byline=0&portrait=0";

export const metadata = pageMetadata({
  title: "Ergonomi — ReAlign Metoden",
  description:
    "Så sitter, står och lyfter du rätt. Praktiska guider för skrivbordsarbete, sömn och vardagsrörelser.",
  image: "/og/ergonomi.png",
  path: "/ergonomi",
});

type Situation = {
  id: string;
  eyebrow: string;
  title: string;
  desc: string;
  videoUrl?: string;
  bad: string[];
  good: string[];
  badImage?: string;
  goodImage?: string;
  tips: string[];
};

const situations: Situation[] = [
  {
    id: "sitta",
    eyebrow: "01 — Vid skrivbordet",
    title: "Sitta",
    desc: "De flesta av oss sitter 6–9 timmar per dag. Det handlar inte om att sitta \"perfekt\" hela tiden, utan om att undvika samma statiska position för länge.",
    videoUrl: "https://player.vimeo.com/video/1218399947?h=1a3cddd537&title=0&byline=0&portrait=0",
    bad: [
      "Höfterna glider fram, ryggen rundas",
      "Huvudet skjuts framåt mot skärmen",
      "Axlarna dras upp mot öronen",
    ],
    good: [
      "Sittben i botten av stolen, höfter något över knän",
      "Öron, axlar och höft i linje",
      "Fötterna platt i golvet, axlar avslappnade",
    ],
    tips: [
      "Sitt med fötterna platt i golvet och en naturlig svank. Vill du ha en extra hållningsstärkande position, sitt långt fram på stolskanten med rak rygg.",
      "Om du korsar benen, växla sida då och då för att undvika snedbelastning.",
      "I soffan: använd kuddar bakom ryggen som stöd för svanken, och byt position med jämna mellanrum.",
      "Res dig upp minst en gång per 30 minuter — även en kort paus bryter den statiska belastningen.",
      "Skärmens överkant i höjd med ögonen, en armlängd bort.",
      "Häng inte i ländryggsstödet — aktivera bålen lätt istället för att kollapsa in i stolen.",
      "Håll mobilen i ögonhöjd istället för att böja nacken nedåt mot den.",
      "Jobbar du på laptop en längre stund, höj den och koppla in ett separat tangentbord.",
    ],
  },
  {
    id: "sta",
    eyebrow: "02 — I kön, vid disken",
    title: "Stå",
    desc: "Stående vila är sällan verklig vila för kroppen — vanan att luta sig i en höft belastar snett över tid.",
    videoUrl: "https://player.vimeo.com/video/1218400129?h=a58bf4e414&title=0&byline=0&portrait=0",
    bad: [
      "Tyngden vilar i en höft (\"skevstående\")",
      "Knäna låsta bakåt",
      "Bröstkorgen sjunker, magen faller fram",
    ],
    good: [
      "Vikt jämnt fördelad över båda fötterna",
      "Mjuka, olåsta knän",
      "Bäckenet i neutralt läge, bröstkorg lyft",
    ],
    tips: [
      "Stå med fötterna i höftbredd, pekandes rakt fram, med jämn belastning på båda fötterna. Föreställ dig en tråd som drar rakt upp genom hjässan, och slappna av i mage, ländrygg och säte.",
      "Om du har för vana att hänga på en höft, växla sida regelbundet för att undvika snedbelastning.",
      "Byt ståställning aktivt istället för att fastna i en position — kroppen gillar variation, inte perfekt hållning i timmar.",
      "Stå gärna med en fot lätt förhöjd (t.ex. på en pallkant) om du står länge i köket.",
    ],
  },
  {
    id: "lyfta",
    eyebrow: "03 — Flyttkartonger, matkassar",
    title: "Lyfta",
    desc: "De flesta ryggskador vid lyft sker inte av tunga saker, utan av lätta saker lyfta fel — ofta i en vriden position.",
    videoUrl: "https://player.vimeo.com/video/1218398436?h=3622425e3c&title=0&byline=0&portrait=0",
    bad: [
      "Böjer i ryggen med raka ben",
      "Vrider bålen samtidigt som man lyfter",
      "Håller lasten långt från kroppen",
    ],
    good: [
      "Böj i höft och knä, håll ryggen lång",
      "Vänd hela kroppen med fötterna, inte bålen",
      "Håll lasten nära kroppen genom hela lyftet",
    ],
    tips: [
      "Böj knäna och håll ryggen rak — fäll dig framåt från höfterna eller gör ett utfall istället för att böja i ländryggen.",
      "När du bär saker, håll skulderbladen bakåt och bröstryggen rak för att avlasta axlar och nacke.",
      "Andas ut på vägen upp — det stabiliserar bålen naturligt.",
      "Osäker på vikten? Testa att luta lasten innan du lyfter den helt, istället för att chansa.",
    ],
  },
  {
    id: "sova",
    eyebrow: "04 — Nattens 7–8 timmar",
    title: "Sova",
    desc: "En tredjedel av livet spenderas liggande — sovställning och kuddhöjd påverkar hållningen minst lika mycket som dagens rörelser.",
    bad: ["Sover på mage med vriden nacke", "För hög eller för platt kudde i sidoläge"],
    good: [
      "Rygg- eller sidoläge med neutral nacke",
      "Kudde mellan knäna i sidoläge avlastar höft och bäcken",
    ],
    badImage:
      "https://images.unsplash.com/photo-1531353826977-0941b4779a1c?auto=format&fit=crop&w=400&h=300&q=80&sat=-100&con=6&bri=5",
    goodImage:
      "https://images.unsplash.com/photo-1520206183501-b80df61043c2?auto=format&fit=crop&w=400&h=300&q=80&sat=-100&con=6&bri=5",
    tips: [
      "Välj en madrass som stödjer ryggradens naturliga kurvatur, och variera gärna mellan att sova på sidan och på ryggen.",
      "Undvik för många kuddar under huvudet — det skapar en framskjuten huvudposition (\"gamnacke\").",
      "Ligg inte på mage med huvudet vridet åt samma håll för länge — det kan skapa obalans i både nacke och bäcken.",
      "Kuddhöjden ska hålla nacken i linje med resten av ryggraden — varken böjd upp eller ner.",
    ],
  },
];

const habits = [
  {
    title: "Andning",
    items: [
      "Slappna av i magen och andas med hjälp av diafragman — magen och nedre bröstkorgen ska expandera vid inandning.",
      "Det är naturligt att magmusklerna spänns vid lyft och ansträngning, inte i vila som sittande, stående eller gång.",
    ],
  },
  {
    title: "Gång",
    items: [
      "Slappna av i magen och gå med en naturlig steglängd, där foten landar under kroppen snarare än framför.",
      "Låt armarna röra sig naturligt längs kroppen och håll fötterna raka.",
    ],
  },
  {
    title: "Löpning",
    items: [
      "Håll kroppen upprätt genom \"tråden\" och slappna av i fötter och underben.",
      "Undvik för långa steg — det ger en felaktig hällandning och onödig belastning på knän, höfter och ländrygg.",
    ],
  },
  {
    title: "Cykling",
    items: [
      "Ställ in sadeln så att benen är nästan raka längst ner i pedalrörelsen.",
      "Håll kroppen upprätt, knäna riktade framåt, slappna av i magen och undvik att gunga i sidled. Sikta på en lätt framåttippning av bäckenet för rätt momentum.",
    ],
  },
  {
    title: "Skor & kläder",
    items: [
      "Välj skor som tillåter fotens naturliga bredd och längd, med mjuka sulor som ger fotens naturliga böjrörelse.",
      "Undvik höga klackar eller trånga skor för ofta.",
      "Åtsittande byxor kring bäckenet, t.ex. lågmidjade jeans, kan skapa stelhet.",
    ],
  },
  {
    title: "Väskor & plånbok",
    items: [
      "Byt sida regelbundet när du bär väska eller handväska, eller använd ryggsäck för jämnare viktfördelning.",
      "Undvik att bära plånboken i bakfickan — det kan skapa snedbelastning när du sitter.",
    ],
  },
  {
    title: "Skärmarbete",
    items: [
      "\"Tech-neck\" — den framåtböjda nackhållningen vid mobil och laptop — är en av de vanligaste orsakerna till nack- och axelspänning idag.",
      "Korta, återkommande pauser slår långa sporadiska — sikta på rörelse varje halvtimme.",
    ],
  },
  {
    title: "Allmänna tips",
    items: [
      "Sitter du mycket på jobbet? Använd ett höj- och sänkbart skrivbord och växla mellan att stå och sitta.",
      "Ta trapporna istället för hissen — bra träning för vader, lår, rumpa och höfter.",
      "Gå en kort promenad på lunchen, eller kliv av bussen en hållplats tidigare.",
    ],
  },
];

export default async function ErgonomiPage() {
  const [podcastPreview, introPoster, situationPosters] = await Promise.all([
    getSpotifyOembed(EPISODE_ID),
    getVimeoThumbnail(INTRO_VIDEO_URL),
    Promise.all(
      situations.map((s) => (s.videoUrl ? getVimeoThumbnail(s.videoUrl) : Promise.resolve(null))),
    ),
  ]);

  return (
    <>
      <Header />
      <div className="wrap">
        <div className={styles.pageHead}>
          <span className="eyebrow">Ergonomi</span>
        </div>

        <div className={styles.introRow}>
          <div className={styles.awareness}>
            <span className="eyebrow">Innan du börjar</span>
            <h2>Bli posturalt medveten</h2>
            <p>
              Vanliga exempel är att stå och luta på ena höften, korsa benen
              när du sitter, eller bära väskan på samma axel varje gång. Bli
              medveten om dina vanor för att snabbare skapa bestående
              förbättringar.
            </p>
            <div className={styles.awarenessGrid}>
              <div className={styles.awarenessItem}>
                <b>Observera</b>
                <span>Var uppmärksam på din hållning när du står, sitter eller går.</span>
              </div>
              <div className={styles.awarenessItem}>
                <b>Analysera</b>
                <span>Hur ser din hållning faktiskt ut när du står och sitter?</span>
              </div>
              <div className={styles.awarenessItem}>
                <b>Repetitiva rörelser</b>
                <span>Använder du ena sidan av kroppen mer än den andra?</span>
              </div>
              <div className={styles.awarenessItem}>
                <b>Nyfikenhet</b>
                <span>Finns det andra vanor som kan bidra till obalanser?</span>
              </div>
            </div>
          </div>

          <div className={styles.introVideo}>
            <VimeoEmbed
              src={INTRO_VIDEO_URL}
              className={styles.videoFrame}
              poster={introPoster}
            />
            <div className={styles.caption}>Introduktion till postural medvetenhet</div>
          </div>
        </div>

        <JumpNav />

        {situations.map((s, i) => (
          <section className={styles.situation} key={s.id} id={s.id}>
            <div className={styles.sitLabel}>
              <span className="eyebrow">{s.eyebrow}</span>
              <h2>{s.title}</h2>
              <p>{s.desc}</p>
            </div>
            <div>
              {s.videoUrl && (
                <VimeoEmbed
                  src={s.videoUrl}
                  className={`${styles.videoFrame} ${styles.small}`}
                  lazy
                  poster={situationPosters[i]}
                />
              )}
              {!s.videoUrl && (
                <div className={styles.compare}>
                  <div className={`${styles.compareCard} ${styles.bad}`}>
                    <span className={styles.lbl}>Vanligt fel</span>
                    {s.badImage && (
                      <div className={`img-duo ${styles.bodyPhoto}`}>
                        <Image
                          src={s.badImage}
                          alt=""
                          fill
                          sizes="(max-width: 880px) 100vw, 340px"
                        />
                      </div>
                    )}
                    <ul>
                      {s.bad.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${styles.compareCard} ${styles.good}`}>
                    <span className={styles.lbl}>Bättre sätt</span>
                    {s.goodImage && (
                      <div className={`img-duo ${styles.bodyPhoto}`}>
                        <Image
                          src={s.goodImage}
                          alt=""
                          fill
                          sizes="(max-width: 880px) 100vw, 340px"
                        />
                      </div>
                    )}
                    <ul>
                      {s.good.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              {s.tips.map((tip, i) => (
                <div className={styles.tipRow} key={i}>
                  <span className={styles.tipNum}>{String(i + 1).padStart(2, "0")}</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className={styles.extraSection} id="fler-vanor">
          <div className={styles.extraHead}>
            <span className="eyebrow">05 — Fler vardagsvanor</span>
            <h2>Det som händer mellan träningspassen</h2>
            <p>
              Postural träning ger bäst resultat tillsammans med medvetna
              vanor i resten av vardagen — andning, gång, löpning, cykling
              och till och med vilka skor och kläder du väljer.
            </p>
          </div>
          <div className={styles.extraGrid}>
            {habits.map((h) => (
              <div className={styles.extraCard} key={h.title}>
                <h3>{h.title}</h3>
                <ul>
                  {h.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.podcastSection} id="lyssna">
          <span className="eyebrow">06 — Lyssna vidare</span>
          <h2>Fördjupning i podcastform</h2>
          <p>
            Vill du gräva djupare i tankarna bakom postural träning och
            ergonomi? Lyssna på avsnittet direkt här, utan att lämna sidan.
          </p>
          <div className={styles.spotifyFrame}>
            <SpotifyEmbed episodeId={EPISODE_ID} preview={podcastPreview} />
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
