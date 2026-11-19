"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import shellStyles from "./kalender/admin-shell.module.css";

// Popup-skalet för hela-sidor-popupen (se @modal/(.)kunder, (.)leads) —
// stänger med Esc/klick utanför/router.back(), precis som övriga
// admin-modaler. "Öppna på riktigt" är en vanlig <a>, inte <Link>, så den
// gör en riktig helsidesnavigering och inte bara "stänger" popupen genom
// att den intercepterade routen matchar igen. Portat från Cleer Klinik.
export default function AdminModal({
  children,
  fullHref,
}: {
  children: React.ReactNode;
  fullHref: string;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") router.back();
    }
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [router]);

  return (
    <div className={shellStyles.modalOverlay} onClick={() => router.back()}>
      <div className={shellStyles.pageModalBox} onClick={(e) => e.stopPropagation()}>
        <div className={shellStyles.pageModalHead}>
          <a href={fullHref} className={shellStyles.pageModalOpenReal}>
            Öppna på riktigt →
          </a>
          <button
            type="button"
            onClick={() => router.back()}
            className={shellStyles.pageModalCloseBtn}
            aria-label="Stäng"
          >
            ✕
          </button>
        </div>
        <div className={shellStyles.pageModalBody}>{children}</div>
      </div>
    </div>
  );
}
