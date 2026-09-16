export const CLINIC_PROGRAM_VIDEO_BUCKET = "clinic-program-videos";
// Telefoninspelade klipp av en enskild övning — sällan mer än någon minut,
// men ger gott om marginal jämfört med journalens 25 MB (som blandar bilder
// och video) eftersom det här alltid är video.
export const MAX_CLINIC_PROGRAM_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
