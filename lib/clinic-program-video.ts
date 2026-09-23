export const CLINIC_PROGRAM_VIDEO_BUCKET = "clinic-program-videos";
// Telefoninspelade klipp av en enskild övning — sällan mer än någon minut,
// men iPhone-.mov i hög upplösning/bildfrekvens väger betydligt mer än man
// tror för bara någon minut, vilket 100 MB visade sig vara för snålt för
// (se commit "Visa faktiskt felmeddelande..."). 500 MB ger gott om marginal
// även för ett par minuter 4K, jämfört med journalens 25 MB (som blandar
// bilder och video) eftersom det här alltid är video.
export const MAX_CLINIC_PROGRAM_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB
