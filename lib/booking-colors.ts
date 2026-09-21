// Färgval för bokningar i kalenderrutnätet — bara sex fasta alternativ (inte
// en fri färgväljare) så rutnätet inte blir spretigt. Alla är mörka/mättade
// nog för att vit text (bookingTime/bookingName i CalendarGrid) ska gå att
// läsa oavsett vilken som väljs. Portad från Cleer Klinik-sidan men i
// ReAligns egen varma/olivgröna palett istället för Cleers turkosa.
export const BOOKING_COLORS: { label: string; hex: string }[] = [
  { label: "Grön (standard)", hex: "#5e7461" },
  { label: "Terrakotta", hex: "#b8703c" },
  { label: "Lila", hex: "#6a5fd9" },
  { label: "Rosa", hex: "#b85a83" },
  { label: "Grå", hex: "#4b545e" },
  { label: "Marinblå", hex: "#3d5a80" },
];

export const DEFAULT_BOOKING_COLOR = BOOKING_COLORS[0].hex;

export function resolveBookingColor(color: string | null | undefined): string {
  return color || DEFAULT_BOOKING_COLOR;
}
