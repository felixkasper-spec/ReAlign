import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqAccordion, { type FaqGroup } from "@/components/FaqAccordion";

export const metadata: Metadata = {
  title: "Vanliga frågor — ReAlign Metoden",
  description:
    "Svar på de vanligaste frågorna om postural träning, säkerhet, utrustning och vad du kan förvänta dig av ReAlign Metoden.",
};

const groups: FaqGroup[] = [
  {
    eyebrow: "Komma igång",
    items: [
      {
        q: "Är postural träning säkert för mig?",
        a: "För de allra flesta, ja. Övningarna är byggda för att vara skonsamma och ska aldrig göra ont — känner du smärta ska du justera tekniken, minska antal repetitioner, eller hoppa över just den övningen. Har du en pågående skada, är gravid, eller är osäker av någon annan anledning, rekommenderar vi att du pratar med en av våra terapeuter på kliniken eller din vårdgivare innan du börjar.",
      },
      {
        q: "Behöver jag någon utrustning?",
        a: "Nej, de flesta övningarna kräver ingen utrustning alls. Vissa använder en stol, en vägg eller en kudde — vanliga saker du redan har hemma. Ett fåtal mer avancerade övningar är byggda för gymredskap, men det framgår tydligt på varje övning och program.",
      },
      {
        q: "Hur lång tid innan jag märker skillnad?",
        a: "Många känner en skillnad redan efter första passet — en lätthetskänsla i kroppen. Mer varaktiga förändringar i hållning och styrka tar längre tid, ofta några veckor av regelbunden träning, eftersom det handlar om att bygga upp riktig muskelstyrka i de djupa hållningsmusklerna.",
      },
    ],
  },
  {
    eyebrow: "Träningen",
    items: [
      {
        q: "Hur ofta bör jag träna?",
        a: "Det varierar per program, men de flesta rekommenderar 3–5 pass i veckan. Varje övningssida och programsida visar rekommenderad frekvens. Även korta pass ett par gånger i veckan gör skillnad — det viktigaste är regelbundenhet.",
      },
      {
        q: "Kan jag kombinera det här med annan träning?",
        a: "Ja, absolut. Postural träning kompletterar annan träning bra eftersom den bygger upp de djupa musklerna som stabiliserar kroppen — vilket ofta förbättrar prestationen i annan träning också.",
      },
      {
        q: "Vad är skillnaden mellan programmen och övningsbanken?",
        a: "Programmen är färdiga, ordnade sekvenser byggda kring ett specifikt syfte — följ dem steg för steg. Övningsbanken är alla enskilda övningar samlade, för dig som vill söka efter en specifik övning eller bygga ett eget program.",
      },
    ],
  },
  {
    eyebrow: "Konto & priser",
    items: [
      {
        q: "Kostar det något?",
        a: "Övningsbanken, Helkropp Nivå 1–2, Nivå 1 i övriga kategorier samt Bålträning och Kontorsvardag är helt gratis — inget konto krävs för att bläddra. Ett gratis konto låser upp favoriter och schemaläggning. Premium (149 kr/mån) lägger till resten av programbiblioteket, Gymträning, progressionsspårning och veckobrev.",
      },
      {
        q: "Vad ingår i videosamtals-analysen?",
        a: "Ett videosamtal med en av våra terapeuter på kliniken där vi går igenom din kropp och hållning tillsammans, följt av ett program skräddarsytt exakt utifrån vad vi ser hos dig. Kostar 590 kr och är alltid ett separat köp, oavsett om du har Premium eller inte.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <Header />
      <div className="wrap">
        <header style={{ padding: "40px 0 20px" }}>
          <span className="eyebrow">Vanliga frågor</span>
          <h1 style={{ fontSize: "2.5rem", marginTop: 12 }}>Svar innan du börjar.</h1>
          <p style={{ color: "var(--text-soft)", marginTop: 14, fontSize: "1rem", maxWidth: 560 }}>
            Det vanligaste folk undrar innan de sätter igång — om säkerhet,
            utrustning, tid och vad man kan förvänta sig.
          </p>
        </header>

        <FaqAccordion groups={groups} />

        <div
          style={{
            background: "var(--surface)",
            borderRadius: 16,
            padding: "22px 26px",
            margin: "50px 0 30px",
            fontSize: "0.88rem",
            color: "var(--text-soft)",
          }}
        >
          <b style={{ color: "var(--text)" }}>Viktigt att veta:</b> Innehållet
          på ReAlign Metoden ersätter inte medicinsk rådgivning. Har du en
          befintlig skada, kronisk smärta eller är osäker av någon annan
          anledning, prata med en läkare, fysioterapeut eller en av våra
          kliniker innan du påbörjar ett nytt träningsprogram.
        </div>

        <Footer />
      </div>
    </>
  );
}
