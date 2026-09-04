export type LevelTagKey = "beginner" | "intermediate" | "advanced" | "allLevels";

export function levelTagKey(level?: string | null): LevelTagKey {
  if (level === "Medel") return "intermediate";
  if (level === "Avancerad") return "advanced";
  if (level === "Alla nivåer") return "allLevels";
  return "beginner";
}
