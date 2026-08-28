import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpotifyEmbed from "@/components/SpotifyEmbed";
import { getSpotifyOembed } from "@/lib/spotify";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Om metoden — ReAlign Metoden",
  description:
    "Vad är postural träning och varför fungerar det? Läs om Optimum-Metoden — grunden bakom ReAlign Metoden.",
  image: "/og/om-metoden.png",
  path: "/om-metoden",
});

const EPISODE_ID = "7kRVHZhGfmsZCOqJjtyPFF";

export default async function OmMetodenPage() {
  const podcastPreview = await getSpotifyOembed(EPISODE_ID);

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.heroRow}>
          <div className={styles.hero}>
            <span className="eyebrow">Om metoden</span>
            <h1>
              Vad är egentligen <em>postural träning</em>?
            </h1>
            <p>
              Inte stretching. Inte styrketräning i vanlig mening. Postural
              träning handlar om att återge kroppen dess naturliga förmåga
              att bära och fördela belastning — muskel för muskel, tills
              helheten fungerar som den ska.
            </p>
          </div>
          <div className={`img-duo ${styles.heroImage}`}>
            <Image
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&h=560&q=80&sat=-100&con=6&bri=5"
              alt="Postural träning i solnedgången"
              fill
              sizes="(max-width: 800px) 100vw, 440px"
              priority
            />
          </div>
        </div>

        <div className={styles.section} style={{ borderTop: "none", paddingTop: 0 }}>
          <div className={styles.theoryIntro}>
            <div>
              <div className={styles.sectionHead} style={{ marginBottom: 14 }}>
                <span className="eyebrow">Teorin</span>
                <h2>Så fungerar postural träning — på djupet</h2>
              </div>
              <p>
                Vill du förstå exakt vad vi menar med postural träning, och
                varför metoden fungerar? Här går vi på djupet — vad
                postural träning är, vad kroppens naturliga tillstånd
                innebär, hur det går snett, hur de olika delarna hänger
                ihop, och vad lösningen är. Så att du förstår vad vi vill
                uppnå med träningen, och hur det ger dig förutsättningar
                att bli smärtfri, känna dig starkare än någonsin, orka mer
                och känna dig lätt på ett sätt du inte gjort innan.
              </p>
            </div>
            <div className={`img-duo warm ${styles.theoryImage}`}>
              <Image
                src="https://images.unsplash.com/photo-1734873477108-6837b02f2b9d?auto=format&fit=crop&w=700&h=520&q=80&sat=-100&con=6&bri=5"
                alt="Person som står med naturlig, upprätt hållning"
                fill
                sizes="(max-width: 800px) 100vw, 380px"
              />
            </div>
          </div>

          <div className={styles.accordion}>
            <details className={styles.accordionItem}>
              <summary>Vad är postural träning?</summary>
              <div className={styles.accordionBody}>
                <p>
                  Namnet postural terapi/träning kommer från det engelska
                  ordet ”posture”, alltså hållning.
                </p>
                <p>
                  Tanken bakom metoden är att vi balanserar kroppen i sin
                  helhet, istället för att stirra oss blinda på ett
                  specifikt problemområde där vi känner oss svaga, trötta
                  eller till och med har ont.
                </p>
                <p>
                  När vi ser på kroppen på det här sättet får vi helt andra
                  förutsättningar att återskapa kroppens naturliga
                  belastningsfördelning. Då kan vi se mycket mer specifikt
                  varifrån problemet faktiskt härstammar.
                </p>
                <p>
                  Om du till exempel har ont i en axel har du med största
                  sannolikhet fått övningar med gummiband, fått träna
                  axelns muskulatur i olika vinklar — och det har kanske
                  till och med lindrat problemen kortsiktigt.
                </p>
                <p>
                  Det som skiljer postural träning från detta är att vi
                  istället ser på kroppen från topp till tå och
                  identifierar vart det gått snett från början. I det här
                  fallet är axeln med största sannolikhet framåtroterad,
                  och vi behöver självklart träna upp axeln — men det som
                  saknas är att vi inte gör något åt axelns position i
                  relation till resten av kroppen.
                </p>
                <p>
                  Gör skulderbladsmuskulaturen sitt jobb med att hålla ner
                  och bak skulderbladen? Har du ett utplanat bäcken som
                  gjort att du tappat den naturliga kurvaturen i
                  ländryggen, vilket i sin tur gör att du inte längre har
                  förutsättningar för en naturligt fin hållning högre upp i
                  kroppen? Varför har bäckenet då fått en onaturlig
                  position? Finns det muskler i benen eller höfterna som
                  inte gör sitt jobb, vilket gör att du alltid kommer få
                  kämpa för att axlarna inte ska falla fram?
                </p>
                <p>
                  Ja, du förstår poängen. Kort sagt ser man alldeles för
                  trångsynt på olika problem i kroppen — vi behöver ta ett
                  steg tillbaka och se den mer komplexa helheten.
                </p>
                <p>
                  Låter det komplicerat? Goda nyheter: det är inte så
                  komplicerat som det låter.
                </p>
              </div>
            </details>

            <details className={styles.accordionItem}>
              <summary>Vad innebär vårt naturliga tillstånd?</summary>
              <div className={styles.accordionBody}>
                <p>
                  Det finns ett specifikt sätt som en människokropp ska se
                  ut och fungera biomekaniskt. Djupt inne i kroppen finns
                  en grupp muskler som går som en kedja från fotens
                  undersida hela vägen upp till halsen och huvudet — vi
                  kallar den vår posturala kedja.
                </p>
                <p>
                  Dessa musklers uppgift är att hålla kroppen i den
                  naturliga position vi faktiskt är skapade för att ha.
                </p>
                <h4>Vad kännetecknar en optimal hållning?</h4>
                <p>
                  En optimal hållning innebär att vi har en lodlinje längs
                  hela kroppen — hela vägen från foten, upp genom knän,
                  höfter, axlar och öron.
                </p>
                <p>
                  Vi vill ha tredje tån rakt fram, det vill säga att
                  fötterna pekar rakt framåt (vi säger just ”tredje tån”
                  eftersom det lätt kan kännas som att fötterna pekar rakt
                  fram när de egentligen pekar smått inåt eller utåt).
                </p>
                <p>
                  Vi vill också ha naturligt raka knän — i praktiken en
                  lätt böjning — med knäskålarna pekande rakt fram, och
                  symmetri så att höfter, skulderblad och axlar står jämnt.
                </p>
                <p>
                  Vi vill ha en naturlig svank längst ner i ländryggen.
                  Tumregeln är ungefär en handflatas utrymme längst ner i
                  ländryggen om du står med ryggen mot en vägg. Det pratas
                  — med all rätt — mycket om översvank, men det är minst
                  lika vanligt att vi träffar människor med för lite svank,
                  vilket är minst lika problematiskt.
                </p>
                <p>
                  När kroppen ser ut såhär ger vi den förutsättningar att
                  fördela belastningen jämnt över hela kroppen, istället
                  för att en specifik del ska behöva ta upp mer än andra.
                </p>
              </div>
            </details>

            <details className={styles.accordionItem}>
              <summary>På vilka sätt kan det gå snett?</summary>
              <div className={styles.accordionBody}>
                <p>
                  I de flesta fall är det den posturala kedjans muskler vi
                  tappat funktion och styrka i — genom till exempel för
                  mycket sittande eller brist på rörelser som utmanar dem,
                  för att nämna några anledningar.
                </p>
                <p>
                  När de musklerna inte längre gör sitt jobb hamnar vi ur
                  position i våra leder, och kompensationerna sätter igång
                  direkt för att hålla oss någorlunda upprätta. Muskler som
                  inte är designade för att hålla oss upprätta — och som
                  egentligen är till för mer kortvarig aktivitet — behöver
                  då vara aktiva hela dagarna, vilket gör sig hört genom
                  värk, stelhet eller en känsla av att alltid vara trött.
                </p>
                <p>
                  Har du till exempel en krum bröstrygg och ett
                  framskjutet huvud vet vi med säkerhet att nacken kommer
                  behöva jobba mer än den ska för att hålla blicken framåt.
                </p>
                <p>
                  Gör inte hållningsmusklerna runt höfterna sitt jobb med
                  att hålla bäckenet i en naturlig position känner vi
                  direkt att ländryggen hamnar i en onaturlig position, och
                  att dess muskler nu behöver vara igång hela tiden för att
                  hålla ryggen upprätt.
                </p>
              </div>
            </details>

            <details className={styles.accordionItem}>
              <summary>Hur påverkar de olika delarna varandra?</summary>
              <div className={styles.accordionBody}>
                <p>
                  Förändring av positionen på en led leder oundvikligt till
                  förändring av position på andra leder. Det här kallar vi
                  enhetsprincipen.
                </p>
                <p>
                  När muskler som inte är designade för att hålla oss i
                  position ändå tvingas göra det jobbet leder det
                  oundvikligt till problem — men det betyder inte att
                  lösningen är att stärka eller stretcha just den
                  muskulaturen. Med största sannolikhet är den överbelastad
                  på grund av fel ledpositioner, orsakade av att andra
                  delar inte gör sitt jobb.
                </p>
                <p>
                  Det här gäller i sittande, stående, gående, olika
                  böjningar och lyft, löpning och i princip alla andra
                  aktiviteter.
                </p>
                <p>
                  Det är därför du inte kan få ordning på dina problem om
                  vi inte tar det steget tillbaka och ser till helheten:
                  vart har vi hamnat ur position, vad är det som inte gör
                  sitt jobb, och vad tvingas som en konsekvens ta över ett
                  för stort — men också onaturligt — arbete?
                </p>
              </div>
            </details>

            <details className={styles.accordionItem}>
              <summary>Vilka muskler består den posturala kedjan av?</summary>
              <div className={styles.accordionBody}>
                <div className={styles.muscleGrid}>
                  <div className={styles.muscleCard}>
                    <div className={styles.muscleImg}>
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/4/49/Tibialis_posterior.png"
                        alt="Tibialis posterior"
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 300px"
                      />
                    </div>
                    <b>Tibialis posterior</b>
                    <p>
                      Sitter i underbenet och roterar in foten i relation
                      till underbenet, så att vi får en framåtpekande
                      fotposition.
                    </p>
                  </div>
                  <div className={styles.muscleCard}>
                    <div className={styles.muscleImg}>
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Gray439-Musculus_popliteus.png"
                        alt="Popliteus"
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 300px"
                      />
                    </div>
                    <b>Popliteus</b>
                    <p>
                      Sitter snett över knäets baksida och vrider in
                      underbenet i förhållande till låret.
                    </p>
                  </div>
                  <div className={styles.muscleCard}>
                    <div className={styles.muscleImg}>
                      <Image
                        src="/muscles/adductor-magnus.png"
                        alt="Adduktorer"
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 300px"
                      />
                    </div>
                    <b>Adduktorer</b>
                    <p>
                      Sitter på insidan av låret och för lårbenet inåt i
                      förhållande till bäckenet. Jobbar tillsammans med
                      tibialis posterior och popliteus för att vrida in
                      hela benet så att foten kan peka rakt framåt.
                    </p>
                  </div>
                  <div className={styles.muscleCard}>
                    <div className={styles.muscleImg}>
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Psoas_major_muscle11.png"
                        alt="Psoas major"
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 300px"
                      />
                    </div>
                    <b>Psoas major</b>
                    <p>
                      Går från ländryggraden ner till insidan av lårbenet.
                      ”Tippar fram” bäckenet och skapar en naturlig svank.
                      Eftersom bäckenets position är så avgörande för
                      funktionen både nedåt och uppåt i kroppen lägger vi
                      extra fokus på att få igång just den här muskeln
                      ordentligt.
                    </p>
                  </div>
                  <div className={styles.muscleCard}>
                    <div className={styles.muscleImg}>
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/8/85/Iliacus_muscle06.png"
                        alt="Iliacus"
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 300px"
                      />
                    </div>
                    <b>Iliacus</b>
                    <p>
                      Sitter inne i bäckenet och går ihop med psoas major
                      i en gemensam sena — tillsammans kallas de
                      iliopsoas. Hjälper till att tippa fram bäckenet och
                      böja höften, och delar samma viktiga roll i den
                      posturala kedjan.
                    </p>
                  </div>
                  <div className={styles.muscleCard}>
                    <div className={styles.muscleImg}>
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/8/8d/Quadratuslumborum.png"
                        alt="Quadratus lumborum"
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 300px"
                      />
                    </div>
                    <b>QL (quadratus lumborum)</b>
                    <p>
                      Hjälper iliopsoas att föra bäckenet framåt — ger oss
                      en naturlig svank — och jobbar även med
                      sidoböjningar av bålen.
                    </p>
                  </div>
                  <div className={styles.muscleCard}>
                    <div className={styles.muscleImg}>
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/4/4f/Multifidi.png"
                        alt="Multifider & rotatorer"
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 300px"
                      />
                    </div>
                    <b>Multifider & rotatorer</b>
                    <p>
                      Går längs hela ryggraden och är de muskler vi
                      använder för att röra själva ryggraden.
                    </p>
                  </div>
                  <div className={styles.muscleCard}>
                    <div className={styles.muscleImg}>
                      <Image
                        src="/muscles/diafragma.png"
                        alt="Diafragma"
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 300px"
                      />
                    </div>
                    <b>Diafragma</b>
                    <p>
                      Den viktigaste muskeln i andningsprocessen: aktiv
                      andas vi in, avslappnad andas vi ut. Spelar en stor
                      roll för vår förmåga att slappna av i kroppen. En
                      stel diafragma kan dessutom, precis som spända
                      magmuskler, göra oss framåtlutande om den är spänd i
                      vardagen.
                    </p>
                  </div>
                  <div className={styles.muscleCard}>
                    <div className={styles.muscleImg}>
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/4/42/Rhomboideus_major.png"
                        alt="Rhomboideus"
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 300px"
                      />
                    </div>
                    <b>Rhomboideus</b>
                    <p>
                      Sitter mellan skulderbladen och drar dem bakåt,
                      vilket är den position de egentligen ska befinna sig
                      i.
                    </p>
                  </div>
                  <div className={styles.muscleCard}>
                    <div className={styles.muscleImg}>
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/e/e9/Supraspinatus.PNG"
                        alt="Supra-/infraspinatus"
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 300px"
                      />
                    </div>
                    <b>Supra-/infraspinatus</b>
                    <p>
                      Två muskler på skulderbladen som roterar överarmen
                      utåt, vilket bidrar till att lyfta och rotera ut
                      axlarna så att bröstet vidgar sig och vi får en
                      upprätt överkropp.
                    </p>
                  </div>
                  <div className={styles.muscleCard}>
                    <div className={styles.muscleImg}>
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/c/c6/Serratus_anterior.png"
                        alt="Serratus anterior"
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 300px"
                      />
                    </div>
                    <b>Serratus anterior</b>
                    <p>
                      Sitter på sidorna av bröstkorgen och för axlarna
                      nedåt till deras korrekta position.
                    </p>
                  </div>
                  <div className={styles.muscleCard}>
                    <div className={styles.muscleImg}>
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6e/Scalenus.png"
                        alt="Scalenerna"
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 300px"
                      />
                    </div>
                    <b>Scalenerna</b>
                    <p>
                      Sitter på sidan av nacken och för, i det här
                      sammanhanget, huvudet nedåt och bakåt tillbaka till
                      sin position när hållningen förbättras.
                    </p>
                  </div>
                  <div className={styles.muscleCard}>
                    <div className={styles.muscleImg}>
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Sternocleidomastoideus.png"
                        alt="Sternocleidomastoideus"
                        fill
                        sizes="(max-width: 480px) 100vw, (max-width: 800px) 50vw, 300px"
                      />
                    </div>
                    <b>Sternocleidomastoideus</b>
                    <p>
                      Sitter på framsidan av halsen och arbetar
                      tillsammans med scalenerna för att föra huvudet
                      tillbaka till sin position i relation till de andra
                      musklerna.
                    </p>
                  </div>
                </div>
                <p className={styles.muscleOutro}>
                  Alla dessa muskler har en väldigt specifik uppgift i att
                  hålla dig upprätt och jobba i bakgrunden för en naturlig
                  belastningsfördelning. De arbetar, som namnet avslöjar, i
                  en kedja — vilket innebär att om vi tappar en del kan
                  inte heller de andra delarna arbeta som de ska. Vi har
                  till exempel sett många gånger att en klients fotposition
                  kan bidra till en stel nacke, eftersom fel position och
                  fel belastning fortplantar sig uppåt genom kedjan, enligt
                  enhetsprincipen.
                </p>
              </div>
            </details>

            <details className={styles.accordionItem}>
              <summary>Vad är lösningen?</summary>
              <div className={styles.accordionBody}>
                <p>
                  Postural träning handlar om att stärka upp de posturala
                  musklerna, släppa på spänningar i de delar som inte haft
                  förutsättning att slappna av och därför blivit spända
                  och irriterade, samtidigt som vi tar itu med eventuella
                  asymmetrier mellan höger och vänster sida — så att
                  kroppen kan återgå till sin naturliga hållning och
                  belastningsfördelning, och därmed till en avslappnad,
                  stark, energifylld och obehindrad kropp.
                </p>
                <p>
                  Vi rekommenderar att du börjar med lätta program — även
                  om du är van vid träning sedan tidigare — där syftet
                  framför allt är att hitta en tydlig kontakt i
                  hållningsmusklerna och väcka dem till liv. Därefter går
                  vi gradvis, i en kontrollerad och säker takt, vidare till
                  mer belastande program där vi successivt blandar in
                  muskler med mer stabiliserande uppgifter, och självklart
                  även stärker rörelsemusklerna — de yttre musklerna — på
                  ett funktionellt sätt.
                </p>
                <p>
                  Det som gör den här träningen unik är att vi börjar
                  inifrån och ut, och tar allt i rätt ordning.
                </p>
                <p>
                  För att åstadkomma den här balansen räcker det dock inte
                  att bara träna upp den djupa posturala muskulaturen — vi
                  behöver även se på våra vardagliga vanor, som är en stor
                  faktor i hur kroppen formas. Därför går vi igenom hur du
                  kan tänka kring allt från stående, gående och sittande
                  till olika typer av lyft och böjningar, och ger dig
                  konkreta tips för vardagliga situationer som att ligga i
                  soffan eller sängen, köra bil eller använda mobilen.
                </p>
                <p>
                  Har vi ett onaturligt rörelsemönster kan det motverka
                  resultaten vi skapar med själva träningen. Det vi
                  istället vill är att de vardagliga vanorna ska främja
                  rätt mekanik — så att du, när du lyfter, sitter och går
                  korrekt, fortsätter att utmana de djupare musklerna på
                  ett naturligt sätt.
                </p>
                <p>
                  Det är därför dina resultat också kan bli permanenta:
                  genom att du i vardagen stimulerar kroppen rätt behöver
                  du så småningom inte göra dessa övningar för att hålla
                  dig i form. Det betyder att du antingen kan lägga mer tid
                  på de fysiska aktiviteter du egentligen vill göra —
                  eller helt enkelt lägga mindre tid på träning i ditt liv.
                </p>
                <Link
                  className="btn btn-primary"
                  href="/program"
                  style={{ marginTop: 18, display: "inline-block" }}
                >
                  Se våra program →
                </Link>
              </div>
            </details>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Ursprunget</span>
            <h2>Grundad i Optimum-Metoden — ovanligt tillgänglig.</h2>
          </div>
          <p>
            ReAlign Metoden bygger på Optimum-Metoden, en etablerad
            utbildning inom postural träning. Felix, grundaren bakom
            ReAlign Metoden, är utbildad Postural Terapeut via
            Optimum-Metoden efter fem års heltidsarbete med metoden på
            Cleer Klinik.
          </p>
          <p>
            Tillgång till Optimum-Metoden kräver normalt antingen ett besök
            hos en fysisk utövare eller en bokad onlinesession. Här får du
            samma grund öppet och till stor del helt gratis — inget vi
            känner till att någon annan erbjuder i samma omfattning.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Grundorsaken</span>
            <h2>Varför gör det ont — egentligen?</h2>
          </div>
          <p>
            Kronisk värk i kroppen handlar sällan om en enskild skada.
            Oftast har muskler och leder gradvis förlorat sin förmåga att
            fördela den belastning kroppen utsätts för i vardagen. När det
            sker tar andra muskler över — ofta ytligare muskler som inte är
            gjorda för att bära det ansvaret långsiktigt. Resultatet blir
            över- eller snedbelastning, och till slut smärta och sämre
            prestationsförmåga.
          </p>
          <p>
            Det är därför så många upplever att lindring från olika
            behandlingar eller träningsformer bara håller i sig en kort
            period — grundorsaken, den förlorade belastningsfördelningen,
            är fortfarande kvar.
          </p>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Skillnaden</span>
            <h2>Postural träning vs. traditionell träning &amp; rehab</h2>
          </div>
          <div className={styles.compare2}>
            <div className={`${styles.compCol} ${styles.trad}`}>
              <span className={styles.lbl}>Traditionellt</span>
              <ul>
                <li>Fokuserar på symptomet — den onda punkten</li>
                <li>Tränar ofta samma ytliga muskler som redan kompenserar</li>
                <li>Lindring är vanligtvis tillfällig</li>
                <li>Sällan koppling mellan kroppens olika delar</li>
              </ul>
            </div>
            <div className={`${styles.compCol} ${styles.postural}`}>
              <span className={styles.lbl}>Postural träning</span>
              <ul>
                <li>Fokuserar på grundorsaken — belastningsfördelningen</li>
                <li>Väcker och stärker de djupare hållningsmusklerna</li>
                <li>Byggd för varaktig, bestående förändring</li>
                <li>Ser och tränar kroppen som ett sammanhängande system</li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className="eyebrow">Vem passar det för</span>
            <h2>Vanliga anledningar att börja</h2>
          </div>
          <div className={styles.reasonRow}>
            <div className={`img-duo warm ${styles.reasonImage}`}>
              <Image
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=600&h=700&q=80&sat=-100&con=6&bri=5"
                alt="Person tränar bålstyrka på matta"
                fill
                sizes="(max-width: 800px) 100vw, 340px"
              />
            </div>
            <div>
              <p style={{ marginBottom: 10 }}>
                Postural träning passar de flesta — oavsett ålder eller
                träningsbakgrund. Några vanliga skäl till att man börjar:
              </p>
              <div className={styles.reasonGrid}>
                <div className={styles.reason}>
                  <b>Återkommande spänningar</b>Nacke, axlar eller rygg som
                  ständigt känns stel eller öm.
                </div>
                <div className={styles.reason}>
                  <b>Stillasittande vardag</b>Kontorsarbete och skärmtid som
                  satt tydliga spår i hållningen.
                </div>
                <div className={styles.reason}>
                  <b>Återkommande skador</b>Samma typ av besvär som kommer
                  tillbaka gång på gång.
                </div>
                <div className={styles.reason}>
                  <b>Begränsad rörlighet</b>Stelhet som gör vardagliga
                  rörelser tyngre än de borde vara.
                </div>
                <div className={styles.reason}>
                  <b>Vill prestera bättre</b>Idrottare som vill träna
                  smartare och minska skaderisk.
                </div>
                <div className={styles.reason}>
                  <b>Vill bara må bättre</b>Ingen akut smärta — men en
                  känsla av att kroppen kunde fungera bättre.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section} style={{ borderTop: "none", paddingTop: 0 }}>
          <div className={styles.muscleNote}>
            <span className={styles.ic}>◐</span>
            <p>
              <b>Det handlar om hållningsmusklerna.</b> Ländrygg, mage, säte
              och nacke är inte designade för att hålla uppe kroppen i sig —
              det är hållningsmusklernas jobb. När de tappar styrka tar de
              ytliga musklerna över, vilket sliter på kroppen på sikt. Det
              är därför vår träning bygger på progressiv belastningsökning
              specifikt riktad mot dessa muskler, precis som i våra{" "}
              <Link href="/program" style={{ color: "var(--sage)", textDecoration: "underline" }}>
                färdiga program
              </Link>
              .
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.deepDive}>
            <span className="eyebrow">Fördjupning</span>
            <p>
              Om du vill fördjupa dig ytterligare i filosofin bakom
              träningen, rekommenderar vi att du lyssnar på detta
              podcast-avsnitt.
            </p>
            <div className={styles.spotifyFrame}>
              <SpotifyEmbed episodeId={EPISODE_ID} preview={podcastPreview} />
            </div>
          </div>
        </div>

        <div className={styles.ctaBand}>
          <span className="eyebrow" style={{ color: "var(--warm-soft)" }}>
            Redo att testa själv
          </span>
          <h2>Känn skillnaden på egen kropp.</h2>
          <p>Helt gratis. Prova ett kort program redan idag och känn skillnaden direkt.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link className="btn btn-primary btn-lg" href="/program/helkropp-niva-2?langd=kort">
              Testa ett kort program
            </Link>
            <Link className="btn btn-primary btn-lg" href="/program">
              Alla program
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
