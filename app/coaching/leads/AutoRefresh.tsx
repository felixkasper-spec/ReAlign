"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Uppdaterar leads-listan i bakgrunden med jämna mellanrum utan att kräva
// en manuell sidladdning — router.refresh() kör bara om Server Component-
// datat, inte hela sidan, så öppna leadrader och ohanterad text i
// kommentarfältet påverkas inte.
export default function AutoRefresh({ intervalMs = 20_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
