import { createAdminClient } from "./supabase/admin";
import { getVimeoThumbnail } from "./vimeo-thumbnail";
import type { PlayerExercise } from "./player-data";

const DEFAULT_DURATION_SECONDS = 90;

type ExerciseRow = {
  slug: string;
  title: string;
  sets_reps: string | null;
  video_url: string | null;
  duration_seconds: number | null;
  instructions: string | null;
};

type ClinicProgramExerciseRow = {
  notes: string | null;
  order_index: number;
  exercises: ExerciseRow | null;
};

// Läser upp ett kundprogram via dess delningskod, helt utan inloggning —
// service-role-klienten kringgår RLS, som annars nekar all läsning via
// anon-nyckeln (se migration 0040).
export async function getClinicProgramPlayerData(token: string, startSlug?: string) {
  const admin = createAdminClient();

  const { data: program } = await admin
    .from("clinic_programs")
    .select("id, label")
    .eq("share_token", token)
    .maybeSingle();

  if (!program) return null;

  const { data: rows } = await admin
    .from("clinic_program_exercises")
    .select("notes, order_index, exercises ( slug, title, sets_reps, video_url, duration_seconds, instructions )")
    .eq("clinic_program_id", program.id)
    .order("order_index");

  const ordered = (rows ?? []) as unknown as ClinicProgramExerciseRow[];

  const thumbnails = await Promise.all(
    ordered.map((row) =>
      row.exercises?.video_url ? getVimeoThumbnail(row.exercises.video_url) : Promise.resolve(null),
    ),
  );

  const exercises: PlayerExercise[] = ordered
    .filter((row): row is ClinicProgramExerciseRow & { exercises: ExerciseRow } => row.exercises != null)
    .map((row, i) => ({
      slug: row.exercises.slug,
      title: row.exercises.title,
      setsReps: row.notes?.trim() || row.exercises.sets_reps?.split(" · ")[0] || null,
      blurb: row.exercises.instructions?.split("\n\n")[0] ?? null,
      instructions: row.exercises.instructions,
      videoUrl: row.exercises.video_url,
      durationSeconds: row.exercises.duration_seconds ?? DEFAULT_DURATION_SECONDS,
      thumbnailUrl: thumbnails[i]?.url ?? null,
      aspectRatio: thumbnails[i]?.aspectRatio ?? 16 / 9,
    }));

  const initialIndex = Math.max(
    0,
    exercises.findIndex((ex) => ex.slug === startSlug),
  );

  return { id: program.id, label: program.label, exercises, initialIndex };
}

// Räknas bara upp från listsidan (/p/[token]), inte spelarsidan — annars
// skulle en enda övningssession blåsa upp siffran onödigt mycket. Enkel
// läs-sen-skriv istället för en atomisk increment i databasen: helt okej
// här eftersom det är en lågtrafik-räknare för en enskild coach, inte en
// siffra som behöver vara exakt under samtidiga skrivningar.
export async function recordClinicProgramVisit(id: string) {
  const admin = createAdminClient();

  const { data } = await admin
    .from("clinic_programs")
    .select("visit_count")
    .eq("id", id)
    .maybeSingle();

  await admin
    .from("clinic_programs")
    .update({
      visit_count: (data?.visit_count ?? 0) + 1,
      last_visited_at: new Date().toISOString(),
    })
    .eq("id", id);
}
