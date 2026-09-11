"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// Efter att ett nytt kundprogram skapats redirectas hit med ?ny=1 så länken
// kopieras automatiskt — coachen kan skicka den direkt utan extra klick.
// Query-parametern städas bort direkt efteråt så en omladdning av sidan
// inte kopierar länken igen.
export default function CopyLinkButton({
  link,
  autoCopy = false,
}: {
  link: string;
  autoCopy?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const fired = useRef(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Klippbord otillgängligt (t.ex. osäker kontext) — inget att göra åt.
    }
  }, [link]);

  useEffect(() => {
    if (!autoCopy || fired.current) return;
    fired.current = true;
    handleCopy();
    router.replace(pathname, { scroll: false });
  }, [autoCopy, handleCopy, router, pathname]);

  return (
    <button type="button" className="btn btn-primary" onClick={handleCopy}>
      {copied ? "✓ Kopierad" : "Kopiera länk"}
    </button>
  );
}
