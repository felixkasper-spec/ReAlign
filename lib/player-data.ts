import { getCachedProgram, getCachedProgramExercisesFull } from "./program-content-cache";
import { getVimeoThumbnail } from "./vimeo-thumbnail";
import { getSubscription } from "./subscription";
import { createClient } from "./supabase/server";

export type PlayerExercise = {
  slug: string;
  title: string;
  setsReps: string | null;
  blurb: string | null;
  instructions: string | null;
  videoUrl: string | null;
  durationSeconds: number;
  thumbnailUrl: string | null;
  aspectRatio: number;
};

const DEFAULT_DURATION_SECONDS = 90;

type ExerciseRow = {
  slug: string;
  title: string;
  sets_reps: string | null;
  video_url: string | null;
  duration_seconds: number | null;
  instructions: string | null;
};

type ProgramExerciseRow = {
  variant: string;
  is_warmup: boolean;
  order_index: number;
  exercises: ExerciseRow | null;
};

export async function getPlayerData(programSlug: string, variant: string, startSlug?: string) {
  const supabase = await createClient();
  const [program, subscription, userResult] = await Promise.all([
    getCachedProgram(programSlug),
    getSubscription(),
    supabase.auth.getUser(),
  ]);

  if (!program) return null;

  const user = userResult.data.user;
  const locked = program.tier === "premium" && !subscription.active;

  const rows = (await getCachedProgramExercisesFull(program.id)) as unknown as
    | ProgramExerciseRow[]
    | null;

  const warmup: ExerciseRow[] = [];
  const variantRows: ExerciseRow[] = [];
  for (const row of rows ?? []) {
    if (!row.exercises) continue;
    if (row.is_warmup) {
      warmup.push(row.exercises);
    } else if (row.variant === variant) {
      variantRows.push(row.exercises);
    }
  }
  const ordered = [...warmup, ...variantRows];

  const thumbnails = await Promise.all(
    ordered.map((ex) => (ex.video_url ? getVimeoThumbnail(ex.video_url) : Promise.resolve(null))),
  );

  const exercises: PlayerExercise[] = ordered.map((ex, i) => ({
    slug: ex.slug,
    title: ex.title,
    setsReps: ex.sets_reps?.split(" · ")[0] ?? null,
    blurb: ex.instructions?.split("\n\n")[0] ?? null,
    instructions: ex.instructions,
    videoUrl: ex.video_url,
    durationSeconds: ex.duration_seconds ?? DEFAULT_DURATION_SECONDS,
    thumbnailUrl: thumbnails[i]?.url ?? null,
    aspectRatio: thumbnails[i]?.aspectRatio ?? 16 / 9,
  }));

  const initialIndex = Math.max(
    0,
    exercises.findIndex((ex) => ex.slug === startSlug),
  );

  return { program, user, locked, exercises, initialIndex };
}
