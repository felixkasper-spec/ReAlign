declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export type ConsentChoice = "granted" | "denied";

const STORAGE_KEY = "realign_cookie_consent";

export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "granted" || value === "denied" ? value : null;
}

// Uppdaterar Googles Consent Mode-signaler (läses av alla "Google-tagg"-typer
// i GTM, inklusive GA4, utan extra konfiguration där) och gör ett bästa-
// försök mot Meta Pixel också. Pixeln körs som en Anpassad HTML-tagg i GTM
// och läser inte Googles samtyckessignaler automatiskt — den behöver ett
// eget "Consent Settings"-krav satt i GTM för att faktiskt vara skyddad,
// den här fbq-anropet är bara ett komplement, inte en garanti i sig.
export function applyConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, choice);

  window.gtag?.("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });

  window.fbq?.("consent", choice === "granted" ? "grant" : "revoke");
}
