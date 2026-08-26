import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export type SearchItem = { title: string; href: string; group: string };

const PAGES: SearchItem[] = [
  { title: "Program", href: "/program", group: "Sidor" },
  { title: "Övningsbank", href: "/ovningsbank", group: "Sidor" },
  { title: "Ergonomi", href: "/ergonomi", group: "Sidor" },
  { title: "Om metoden", href: "/om-metoden", group: "Sidor" },
  { title: "Vägledning — hitta rätt program", href: "/analys", group: "Sidor" },
  { title: "Premium", href: "/premium", group: "Sidor" },
  { title: "Premium Coaching", href: "/premium-coaching", group: "Sidor" },
  { title: "Videosamtals-analys", href: "/videosamtal", group: "Sidor" },
  { title: "Om oss", href: "/om-oss", group: "Sidor" },
  { title: "Kontakt", href: "/kontakt", group: "Sidor" },
  { title: "Vanliga frågor", href: "/faq", group: "Sidor" },
  { title: "Integritetspolicy", href: "/integritetspolicy", group: "Sidor" },
  { title: "Kommer snart", href: "/kommer-snart", group: "Sidor" },
  { title: "Min sida", href: "/min-sida", group: "Sidor" },
  { title: "Logga in", href: "/login", group: "Sidor" },
  { title: "Skapa konto", href: "/signup", group: "Sidor" },
];

const FEATURES: SearchItem[] = [
  { title: "Bygg eget program", href: "/min-sida/bygg-program", group: "Funktioner" },
  { title: "Mina program", href: "/min-sida#mina-program", group: "Funktioner" },
  { title: "Logga träningspass", href: "/min-sida#schema", group: "Funktioner" },
  { title: "Schemalägg pass", href: "/min-sida#schema", group: "Funktioner" },
  { title: "Favoritövningar", href: "/min-sida#favoriter", group: "Funktioner" },
  { title: "Progression och streak", href: "/min-sida#progression", group: "Funktioner" },
  { title: "Chatt med coach", href: "/min-sida/coaching", group: "Funktioner" },
  { title: "Byt eller uppgradera plan", href: "/min-sida/byt-plan", group: "Funktioner" },
  { title: "Träningshistorik", href: "/min-sida/historik", group: "Funktioner" },
];

export async function GET() {
  const supabase = await createClient();

  const [{ data: programs }, { data: exercises }] = await Promise.all([
    supabase.from("programs").select("title, slug").order("title"),
    supabase.from("exercises").select("title, slug").order("title"),
  ]);

  const programItems: SearchItem[] = (programs ?? []).map((p) => ({
    title: p.title,
    href: `/program/${p.slug}`,
    group: "Program",
  }));

  const exerciseItems: SearchItem[] = (exercises ?? []).map((e) => ({
    title: e.title,
    href: `/ovningsbank/${e.slug}`,
    group: "Övningar",
  }));

  const items: SearchItem[] = [...PAGES, ...FEATURES, ...programItems, ...exerciseItems];

  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" } },
  );
}
