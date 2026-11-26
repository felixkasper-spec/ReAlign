"use client";

// Flytande lead-chattbot, synlig på hela den publika sajten (se
// EXCLUDED_PREFIXES) — inte en del av adminet eller den inloggade
// kundportalen. Hela konversationen hålls bara i klientens state (ingen
// egen databastabell); när AI:n (se lib/chat-widget-actions.ts) har
// kvalificerat besökaren anropar den save_lead, som sparar leadet via
// SAMMA väg som det vanliga anmälan-formuläret — dyker upp i adminets
// Leads-lista precis som vanligt. Portat från Cleer Klinik.
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { sendChatMessage, type ChatMessage } from "@/lib/chat-widget-actions";
import styles from "./ChatWidget.module.css";

// Admin (/coaching), inloggad kundportal (/min-sida), inloggning/registrering
// och den egna annonslandningssidan (som redan har sitt eget leadformulär) —
// chattboten hör inte hemma på någon av dem.
const EXCLUDED_PREFIXES = ["/coaching", "/min-sida", "/login", "/signup", "/coaching-anmalan"];

const GREETING =
  "Hej! Jag är ReAlign Metodens AI-assistent. Vill du ha löpande coaching eller en engångsanalys? Berätta kort vad du är ute efter, så hjälper jag dig vidare.";

// Localstorage-nyckel för att komma ihåg att besökaren redan sett/stängt
// "nudge"-bubblan (se useEffect nedan) — annars skulle den dyka upp på
// nytt vid varje sidladdning, vilket blir tjatigt snarare än hjälpsamt.
const NUDGE_SEEN_KEY = "realign-chat-nudge-seen";

const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

// AI-svaren kan länka till informationssidor (se SYSTEM_PROMPT i
// chat-widget-actions.ts) — meddelandebubblorna renderades tidigare som ren
// text, så en sådan länk visades bara som en död textsträng besökaren fick
// kopiera för hand. Delar upp texten runt URL:er och gör dem till riktiga,
// klickbara länkar istället — resten av texten är fortfarande ren text, ingen
// full markdown-rendering.
//
// Länkar till sajtens EGNA sidor (vilket är allt boten själv föreslår just
// nu) navigeras i samma flik via Next-routern istället för en vanlig <a>-
// hård omladdning — chattwidgeten ligger i root-layouten, utanför
// sidinnehållet, så den (och hela konversationshistoriken) överlever en
// sådan mjuk navigering orörd. En hård sidomladdning (eller target="_blank")
// skulle nollställa hela chatten eller lämna den kvar på den gamla fliken.
// Externa länkar (om det någonsin skulle hända) öppnas fortfarande i en ny
// flik som vanligt.
function renderWithLinks(text: string, router: ReturnType<typeof useRouter>): React.ReactNode[] {
  // OBS: inte URL_PATTERN.test(part) här — en global regex (/g) är
  // stateful (lastIndex), och att återanvända samma instans för både split
  // och test i en loop ger fel resultat. En enkel prefix-koll räcker.
  return text.split(URL_PATTERN).map((part, i) => {
    if (!(part.startsWith("http://") || part.startsWith("https://"))) return part;

    let sameOrigin = false;
    let internalPath = part;
    try {
      const url = new URL(part);
      if (typeof window !== "undefined") {
        sameOrigin = url.hostname.replace(/^www\./, "") === window.location.hostname.replace(/^www\./, "");
      }
      internalPath = `${url.pathname}${url.search}${url.hash}`;
    } catch {
      // Inte en giltig fullständig URL — visa som vanlig text, inte länk.
      return part;
    }

    if (sameOrigin) {
      return (
        <a
          key={i}
          href={internalPath}
          onClick={(e) => {
            e.preventDefault();
            router.push(internalPath);
          }}
        >
          {part}
        </a>
      );
    }

    return (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    );
  });
}

// Döljer chattbubblan helt för riktiga besökare tills Felix uttryckligen
// slår på den. Sätt NEXT_PUBLIC_CHAT_WIDGET_ENABLED=true i Vercels
// miljövariabler när den är klar att gå live — ingen kodändring/deploy
// krävs, bara en ny driftsättning. Måste vara NEXT_PUBLIC_-prefixad
// eftersom beslutet tas i webbläsaren (komponenten är klientsidig och
// renderas på varje sida).
const CHAT_WIDGET_ENABLED = process.env.NEXT_PUBLIC_CHAT_WIDGET_ENABLED === "true";

export default function ChatWidget() {
  const pathname = usePathname();
  const router = useRouter();
  const excluded =
    !CHAT_WIDGET_ENABLED || EXCLUDED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const [open, setOpen] = useState(false);
  // En gång per besökares chattsession — grupperar ihop meddelandena i
  // chat_messages (se lib/chat-widget-actions.ts) till en tråd i admin-vyn.
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [bookingUrl, setBookingUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending, open]);

  // Bubblan är annars lätt att missa nere i hörnet — en liten pratbubbla
  // som uppmuntrar till att faktiskt klicka, synlig en gång per besökare
  // (se NUDGE_SEEN_KEY) tills de stänger den eller öppnar chatten.
  useEffect(() => {
    if (excluded) return;
    try {
      if (localStorage.getItem(NUDGE_SEEN_KEY)) return;
    } catch {
      // Privat läge/blockerad lagring — visa ändå, bara inte ihågkommet.
    }
    const timer = setTimeout(() => setShowNudge(true), 4000);
    return () => clearTimeout(timer);
  }, [excluded]);

  function dismissNudge() {
    setShowNudge(false);
    try {
      localStorage.setItem(NUDGE_SEEN_KEY, "1");
    } catch {
      // Ingen lagring tillgänglig — nudgen kan dyka upp igen nästa besök,
      // inte värt att krångla till för.
    }
  }

  if (excluded) return null;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending || done) return;

    const nextHistory: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextHistory);
    setInput("");
    setPending(true);
    setError(null);

    const result = await sendChatMessage(nextHistory, sessionId);
    setPending(false);

    if (result.type === "error") {
      setError(result.error);
      return;
    }

    setMessages((prev) => [...prev, { role: "assistant", content: result.text }]);
    if (result.type === "lead_saved") {
      setDone(true);
      setBookingUrl(result.bookingUrl);
    }
  }

  return (
    <div className={styles.root}>
      {open && (
        <div className={styles.panel} role="dialog" aria-label="Chatta med ReAlign Metoden">
          <div className={styles.head}>
            <span>
              ReAlign Metoden
              <span className={styles.headSub}>AI-assistent</span>
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Stäng chatt">
              ✕
            </button>
          </div>
          <div className={styles.messages}>
            <div className={`${styles.bubble} ${styles.assistant}`}>{GREETING}</div>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`${styles.bubble} ${m.role === "user" ? styles.user : styles.assistant}`}
              >
                {renderWithLinks(m.content, router)}
              </div>
            ))}
            {pending && <div className={`${styles.bubble} ${styles.assistant}`}>…</div>}
            {error && <p className={styles.error}>{error}</p>}
            <div ref={bottomRef} />
          </div>
          {!done ? (
            <form className={styles.form} onSubmit={handleSend}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Skriv här..."
                disabled={pending}
                aria-label="Ditt meddelande"
              />
              <button type="submit" disabled={pending || !input.trim()}>
                Skicka
              </button>
            </form>
          ) : (
            <div className={styles.doneNote}>
              {bookingUrl && (
                <a
                  href={bookingUrl}
                  className={styles.bookLink}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(bookingUrl);
                  }}
                >
                  Boka din tid nu →
                </a>
              )}
              <p>Chatten är avslutad — vi hör av oss!</p>
            </div>
          )}
        </div>
      )}
      {showNudge && !open && (
        <div className={styles.nudge}>
          Har du en fråga? Fråga mig! 💬
          <button type="button" onClick={dismissNudge} aria-label="Dölj">
            ✕
          </button>
        </div>
      )}
      <button
        type="button"
        className={`${styles.toggle} ${open ? styles.toggleOpen : ""}`}
        onClick={() => {
          setOpen((o) => !o);
          dismissNudge();
        }}
        aria-label={open ? "Stäng chatt" : "Öppna chatt"}
      >
        {open ? (
          "✕"
        ) : (
          <>
            <span aria-hidden="true">💬</span>
            <span>Chatta</span>
          </>
        )}
      </button>
    </div>
  );
}
