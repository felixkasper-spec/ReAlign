import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Integritetspolicy — ReAlign Metoden",
  description:
    "Så behandlar ReAlign Metoden dina personuppgifter — vilka uppgifter vi samlar in, varför, och vilka rättigheter du har.",
  image: "/og/default.png",
});

export default function IntegritetspolicyPage() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header style={{ padding: "40px 0 10px" }}>
          <span className="eyebrow">Integritet</span>
          <h1 style={{ fontSize: "2.2rem", marginTop: 12 }}>Integritetspolicy</h1>
          <p className={styles.updated}>Senast uppdaterad: 26 augusti 2026</p>
        </header>

        <div className={styles.section}>
          <h2>Vem ansvarar för dina uppgifter</h2>
          <p>
            Felix Kasper AB, org.nr 559555-6951, är personuppgiftsansvarig
            för de personuppgifter som behandlas när du använder ReAlign
            Metoden (realignmetoden.se). Har du frågor om hur vi hanterar
            dina uppgifter, kontakta oss på{" "}
            <a href="mailto:kontakt@realignmetoden.se">kontakt@realignmetoden.se</a>.
          </p>
        </div>

        <div className={styles.section}>
          <h2>Vilka uppgifter vi samlar in</h2>
          <ul>
            <li>Namn och e-postadress när du skapar ett konto</li>
            <li>Betalningsuppgifter vid köp av Premium eller Premium Coaching (hanteras av Stripe, se nedan — vi lagrar aldrig dina kortuppgifter själva)</li>
            <li>Svar du lämnar i vår programrekommendation (analysen på /analys)</li>
            <li>Favoriter, sparade program och din träningshistorik i tjänsten</li>
            <li>Meddelanden, bilder och videor du skickar i chatten med din coach (endast Premium Coaching)</li>
            <li>Uppgifter du skriver in i kontaktformuläret</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>Varför vi behandlar dina uppgifter</h2>
          <p>Vi använder dina uppgifter för att:</p>
          <ul>
            <li>Leverera tjänsten till dig — skapa och driva ditt konto, visa dina program och din historik</li>
            <li>Hantera betalningar och prenumerationer</li>
            <li>Ge dig stöd via coach-chatten om du har Premium Coaching</li>
            <li>Svara på frågor du skickar via kontaktformuläret eller mejl</li>
            <li>Skicka viktig information om ditt konto eller köp</li>
          </ul>
          <p>
            Den rättsliga grunden är i första hand att uppfylla avtalet vi
            har med dig som kund (leverera tjänsten du betalar för eller
            har skapat ett konto för), samt i vissa fall vårt berättigade
            intresse av att kunna kontakta dig om din tjänst.
          </p>
        </div>

        <div className={styles.section}>
          <h2>E-post vi skickar till dig</h2>
          <p>Genom att skapa ett konto eller köpa en tjänst godkänner du att vi mejlar dig:</p>
          <ul>
            <li>Bekräftelser på köp, kvitton och kontorelaterad information</li>
            <li>Svar från oss eller din coach på det du hört av dig om</li>
            <li>Viktiga uppdateringar om tjänsten, t.ex. ändrade villkor eller planerat underhåll</li>
            <li>Om du har Premium: veckobrev och annan information kopplad till din träning</li>
          </ul>
          <p>
            Du kan när som helst avregistrera dig från utskick som inte är
            nödvändiga för att leverera tjänsten (t.ex. veckobrevet) genom
            att kontakta oss på{" "}
            <a href="mailto:kontakt@realignmetoden.se">kontakt@realignmetoden.se</a>.
            Kvitton, kontobekräftelser och svar på dina egna meddelanden kan
            vi inte stänga av, eftersom de krävs för att leverera tjänsten.
          </p>
        </div>

        <div className={styles.section}>
          <h2>Vem vi delar uppgifter med</h2>
          <p>
            Vi säljer aldrig dina uppgifter. För att driva tjänsten
            använder vi ett fåtal noga utvalda underleverantörer, som var
            och en bara får tillgång till de uppgifter de behöver för sin
            del av tjänsten:
          </p>
          <ul>
            <li><b>Stripe</b> — hanterar alla betalningar och lagrar dina betalkortsuppgifter</li>
            <li><b>Supabase</b> — vår databas- och inloggningsleverantör, lagrar kontouppgifter och träningsdata</li>
            <li><b>Vercel</b> — driftar själva webbplatsen</li>
            <li><b>Hostinger</b> — vår leverantör för e-post</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>Hur länge vi sparar dina uppgifter</h2>
          <p>
            Vi sparar dina uppgifter så länge du har ett aktivt konto hos
            oss. Avslutar du ditt konto raderar vi dina personuppgifter
            inom rimlig tid, förutom sådant vi enligt lag (t.ex.
            bokföringslagen) är skyldiga att spara längre, som
            betalningsunderlag.
          </p>
        </div>

        <div className={styles.section}>
          <h2>Cookies</h2>
          <p>
            Vi använder endast nödvändiga cookies för att hålla dig
            inloggad och för att tjänsten ska fungera tekniskt. Vi
            använder inga cookies för reklam eller spårning i marknadsföringssyfte.
          </p>
        </div>

        <div className={styles.section}>
          <h2>Dina rättigheter</h2>
          <p>Enligt GDPR har du rätt att:</p>
          <ul>
            <li>Få veta vilka uppgifter vi har om dig</li>
            <li>Få felaktiga uppgifter rättade</li>
            <li>Få dina uppgifter raderade</li>
            <li>Invända mot eller begränsa viss behandling</li>
            <li>Få ut dina uppgifter i ett läsbart format (dataportabilitet)</li>
          </ul>
          <p>
            Kontakta oss på{" "}
            <a href="mailto:kontakt@realignmetoden.se">kontakt@realignmetoden.se</a>{" "}
            för att utöva någon av dina rättigheter. Du har också alltid
            rätt att lämna klagomål till Integritetsskyddsmyndigheten
            (IMY).
          </p>
        </div>

        <div className={styles.section}>
          <h2>Ändringar av policyn</h2>
          <p>
            Vi kan uppdatera den här policyn om tjänsten förändras.
            Väsentliga ändringar meddelar vi dig om via mejl eller på
            webbplatsen. Datumet högst upp visar när policyn senast
            ändrades.
          </p>
        </div>

        <div className={styles.note}>
          <b style={{ color: "var(--text)" }}>Frågor?</b> Hör av dig till{" "}
          <a href="mailto:kontakt@realignmetoden.se" style={{ color: "var(--sage)" }}>
            kontakt@realignmetoden.se
          </a>
          .
        </div>

        <Footer />
      </div>
    </>
  );
}
