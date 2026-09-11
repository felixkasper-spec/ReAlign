export const COACHING_JOURNAL_BUCKET = "coaching-journal";
export const MAX_JOURNAL_ATTACHMENT_BYTES = 25 * 1024 * 1024; // 25 MB

export function journalAttachmentTypeFromMime(
  mime: string,
): "image" | "video" | null {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return null;
}
