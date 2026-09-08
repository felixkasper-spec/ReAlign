import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

/**
 * Cachade läsningar av program- och övningsinnehåll (publik data, samma för
 * alla besökare oavsett inloggning). unstable_cache kräver en klient utan
 * cookies-beroende, så vi använder en ren anon-klient istället för
 * lib/supabase/server.ts — samma rättigheter som en utloggad besökare redan
 * har.
 *
 * 1 timmes gräns är ett säkerhetsnät, inte den huvudsakliga
 * cache-invalideringen: varje deploy startar en ny cache-generation, så en
 * innehållsändring som följs av en git push (vilket den nästan alltid gör i
 * det här arbetsflödet) syns direkt. Ren datamigrering utan efterföljande
 * push kan dröja upp till en timme innan den syns live.
 */

function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

const CACHE_OPTIONS = { revalidate: 3600, tags: ["programs"] };

export const getCachedProgram = unstable_cache(
  async (slug: string) => {
    const supabase = publicClient();
    const { data } = await supabase
      .from("programs")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return data;
  },
  ["program-by-slug"],
  CACHE_OPTIONS,
);

export const getCachedProgramExercises = unstable_cache(
  async (programId: string) => {
    const supabase = publicClient();
    const { data } = await supabase
      .from("program_exercises")
      .select("variant, is_warmup, order_index, exercises ( slug, title, body_part )")
      .eq("program_id", programId)
      .order("order_index");
    return data;
  },
  ["program-exercises-by-program-id"],
  CACHE_OPTIONS,
);

export const getCachedProgramExercisesFull = unstable_cache(
  async (programId: string) => {
    const supabase = publicClient();
    const { data } = await supabase
      .from("program_exercises")
      .select(
        "variant, is_warmup, order_index, exercises ( slug, title, sets_reps, video_url, duration_seconds, instructions )",
      )
      .eq("program_id", programId)
      .order("order_index");
    return data;
  },
  ["program-exercises-full-by-program-id"],
  CACHE_OPTIONS,
);

export const getCachedNextLevelProgram = unstable_cache(
  async (category: string, level: number) => {
    const supabase = publicClient();
    const { data } = await supabase
      .from("programs")
      .select("slug, title")
      .eq("category", category)
      .eq("level", level)
      .maybeSingle();
    return data;
  },
  ["next-level-program"],
  CACHE_OPTIONS,
);
