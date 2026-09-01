"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { pushToDataLayer } from "@/lib/gtm";

// Inloggning går via en server action (formulär-POST + redirect) utan
// något klient-sidan-steg att haka in ett dataLayer.push i. Löst genom
// att skicka med ?login=success i redirecten och trigga pushen härifrån
// när sidan väl laddats i webbläsaren — sedan städas query-parametern
// bort så den inte råkar avfyras igen vid en vanlig sidladdning/refresh.
//
// Detta ersätter en tidigare version som pushade "login" varje gång
// Header monterades och en inloggad användare fanns (dvs. på i princip
// varje sidvisning för alla inloggade användare) — den här varianten
// avfyras exakt en gång per faktisk inloggning.
export default function LoginAnalytics({
  userId,
  shouldFire,
}: {
  userId: string;
  shouldFire: boolean;
}) {
  const router = useRouter();
  const fired = useRef(false);

  useEffect(() => {
    if (!shouldFire || fired.current) return;
    fired.current = true;
    pushToDataLayer({ event: "login", user_id: userId });
    router.replace("/min-sida", { scroll: false });
  }, [shouldFire, userId, router]);

  return null;
}
