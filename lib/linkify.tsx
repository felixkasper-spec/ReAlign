import type { ReactNode } from "react";

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
const TRAILING_PUNCTUATION = /[.,;:!?)\]}]+$/;

/**
 * Gör URL:er i en meddelandetext klickbara utan att röra resten av
 * texten via dangerouslySetInnerHTML — delar upp strängen och bygger
 * <a>-element för de delar som ser ut som länkar.
 */
export function linkify(text: string): ReactNode[] {
  return text.split(URL_REGEX).map((part, i) => {
    if (!/^(https?:\/\/|www\.)/.test(part)) {
      return part;
    }

    const trailingMatch = part.match(TRAILING_PUNCTUATION);
    const trailing = trailingMatch ? trailingMatch[0] : "";
    const clean = trailing ? part.slice(0, -trailing.length) : part;
    const href = clean.startsWith("http") ? clean : `https://${clean}`;

    return (
      <span key={i}>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {clean}
        </a>
        {trailing}
      </span>
    );
  });
}
