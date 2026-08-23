import "server-only";
import { createClient } from "@/lib/supabase/server";

export type SequenceExercise = {
  slug: string;
  title: string;
};

/**
 * Bygger samma ordnade övningslista som visas på en programsida (uppvärmning
 * följt av den valda längdvarianten), för att kunna räkna ut föregående/
 * nästa övning på övningssidan när man kommer dit via ett program.
 */
export async function getProgramExerciseSequence(
  programSlug: string,
  variant: string,
): Promise<{ programTitle: string; sequence: SequenceExercise[] } | null> {
  const supabase = await createClient();

  const { data: program } = await supabase
    .from("programs")
    .select("id, title")
    .eq("slug", programSlug)
    .maybeSingle();

  if (!program) return null;

  const { data: rows } = await supabase
    .from("program_exercises")
    .select("variant, is_warmup, order_index, exercises ( slug, title )")
    .eq("program_id", program.id)
    .order("order_index");

  const warmup: SequenceExercise[] = [];
  const main: SequenceExercise[] = [];

  for (const row of rows ?? []) {
    const ex = row.exercises as unknown as SequenceExercise | null;
    if (!ex) continue;
    if (row.is_warmup) {
      warmup.push(ex);
    } else if (row.variant === variant) {
      main.push(ex);
    }
  }

  return { programTitle: program.title, sequence: [...warmup, ...main] };
}
