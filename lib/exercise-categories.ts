/**
 * Override-tabell för övningar som hör hemma i fler än en kategori (eller i
 * en annan kategori än exercises.body_part). Ligger i kod snarare än en ny
 * databaskolumn — samma mönster som lib/program-meta.ts — så vi slipper en
 * schemaändring bara för det här. Övningar som inte finns här behåller sin
 * body_part som enda kategori.
 */
const CATEGORY_OVERRIDES: Record<string, string[]> = {
  airbench: ["Höft & bäcken"],

  "crocodile-crunches": ["Bål"],
  "flutter-kicks": ["Bål"],
  "postural-plank": ["Bål"],
  "wall-sidelying-hip-lifts": ["Bål"],

  "squats-gym": ["Höft & bäcken", "Knä & ben", "Helkropp"],
  "squatting-at-door": ["Höft & bäcken", "Knä & ben", "Helkropp"],
  "romanian-deadlift": ["Höft & bäcken", "Knä & ben", "Helkropp"],
  deadlift: ["Höft & bäcken", "Knä & ben", "Helkropp"],
  "squatting-overhead": ["Höft & bäcken", "Knä & ben", "Helkropp"],
  standups: ["Höft & bäcken", "Knä & ben", "Helkropp"],
  "sumo-squats": ["Höft & bäcken", "Knä & ben", "Helkropp"],

  "postural-pushups": ["Nacke & axlar & skulderblad", "Bål"],

  "cablecross-shoulder-abduction": ["Nacke & axlar & skulderblad", "Rygg"],
  "cablecross-shoulder-rotation": ["Nacke & axlar & skulderblad", "Rygg"],
  "standing-wall-clock": ["Nacke & axlar & skulderblad", "Rygg"],
  "standing-shoulder-rolls": ["Nacke & axlar & skulderblad", "Rygg"],
  "standing-shoulder-shrugs": ["Nacke & axlar & skulderblad", "Rygg"],
  "static-back-reverse-presses": ["Nacke & axlar & skulderblad", "Rygg"],
  "static-back-goal-post-presses": ["Nacke & axlar & skulderblad", "Rygg"],
  "static-back-pullover-presses": ["Nacke & axlar & skulderblad", "Rygg"],

  "cats-and-dogs": ["Rygg", "Höft & bäcken"],

  "active-cobra": ["Höft & bäcken", "Nacke & axlar & skulderblad"],
  "wide-cobra": ["Rygg", "Nacke & axlar & skulderblad"],

  "standing-forward-bends-sides-up-down": ["Rygg", "Helkropp"],

  "static-dog-position": ["Rygg", "Nacke & axlar & skulderblad"],
  "kneeling-table-top-stretch": ["Rygg", "Nacke & axlar & skulderblad"],
  "downward-dog": ["Rygg", "Nacke & axlar & skulderblad"],
  "cablecross-one-arm-rows": ["Rygg", "Nacke & axlar & skulderblad"],
  "active-floor-clock": ["Rygg", "Nacke & axlar & skulderblad"],
  "back-extension-rotation": ["Rygg", "Nacke & axlar & skulderblad"],
  "cablecross-one-arm-pulldown": ["Rygg", "Nacke & axlar & skulderblad"],

  "bridges-wide": ["Höft & bäcken", "Knä & ben"],
  "bridge-single-leg": ["Höft & bäcken", "Knä & ben"],
  "lateral-lunges-wall": ["Höft & bäcken", "Knä & ben"],
};

export function getExerciseCategories(slug: string, bodyPart: string): string[] {
  return CATEGORY_OVERRIDES[slug] ?? [bodyPart];
}
