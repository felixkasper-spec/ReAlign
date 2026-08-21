import "server-only";
import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type CategoryCount = { category: string; count: number };

export type ProgressionStats = {
  weekCount: number;
  monthCount: number;
  streak: number;
  byCategory: CategoryCount[];
};

function toDateKey(iso: string) {
  return iso.slice(0, 10); // YYYY-MM-DD (UTC)
}

/**
 * Räknar ut enkel progressionsstatistik: pass senaste veckan/månaden,
 * en sammanhängande "streak" av dagar med minst ett loggat pass, samt
 * fördelning per programkategori. Premium-funktion enligt briefingen.
 */
export async function getProgressionStats(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<ProgressionStats> {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 90);

  const { data: sessions } = await supabase
    .from("logged_sessions")
    .select("completed_at, programs ( category )")
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .gte("completed_at", since.toISOString());

  const rows = sessions ?? [];
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

  let weekCount = 0;
  let monthCount = 0;
  const dateSet = new Set<string>();
  const categoryCounts = new Map<string, number>();

  for (const row of rows) {
    const completedAt = new Date(row.completed_at as string).getTime();
    if (completedAt >= weekAgo) weekCount++;
    if (completedAt >= monthAgo) monthCount++;
    dateSet.add(toDateKey(row.completed_at as string));

    const category = (row.programs as unknown as { category: string } | null)
      ?.category;
    if (category) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
  }

  let streak = 0;
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  if (!dateSet.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  while (dateSet.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  const byCategory = [...categoryCounts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return { weekCount, monthCount, streak, byCategory };
}
