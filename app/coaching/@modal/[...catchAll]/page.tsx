// Stänger popupen vid mjuk (klientsidig) navigering till en sida som inte
// har en egen intercepterad popup-variant (t.ex. byter man från "Kunder" i
// sidomenyn till "Leads" medan en popup är öppen) — annars skulle slotten
// behålla den gamla popupens innehåll kvar synligt. Se parallel-routes.md,
// "Good to know" under Modals-avsnittet.
export default function ModalCatchAll() {
  return null;
}
