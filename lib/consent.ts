import { pushToDataLayer } from "./gtm";

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
// försök mot Meta Pixel också. Pixeln körs som en Anpassad HTML-tagg i GTM,
// och GTM:s "vänta och avfyra igen när samtycke beviljas"-mekanik för
// Consent Settings visade sig i praktiken inte trigga om sådana taggar när
// samtycket uppdateras efter att sidan redan laddats (bekräftat: taggen
// blockeras korrekt på det första, tidiga eventet, men avfyras aldrig igen
// trots att samtycket senare blir beviljat). Därför pushar vi också en
// vanlig namngiven dataLayer-händelse här — en andra trigger i GTM kopplad
// till den händelsen ger taggen ett nytt tillfälle att utvärderas, precis
// som login-eventet redan används som en andra trigger på bas-taggen.
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

  pushToDataLayer({ event: "cookie_consent_update", consent: choice });
}
