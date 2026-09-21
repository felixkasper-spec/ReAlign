import type { Metadata } from "next";
import Link from "next/link";
import { requireCoach } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { COACHING_ATTACHMENT_BUCKET } from "@/lib/coaching-attachments";
import styles from "../page.module.css";

export const metadata: Metadata = {
  title: "Kom igång-formulär — ReAlign Metoden",
};

export default async function CoachingIntakePage() {
  await requireCoach();
  const admin = createAdminClient();

  const { data: intakes } = await admin
    .from("coaching_intake")
    .select(
      "id, height_cm, weight_kg, symptoms, pain_level, previous_injuries, medications, sedentary_work, sleep_habits, current_training, equipment_access, session_length, weekly_time_budget, goals, other_info, photo_front_path, photo_back_path, photo_left_path, photo_right_path, submitted_at, profiles(display_name, email)",
    )
    .order("submitted_at", { ascending: false });

  const PHOTO_FIELDS = [
    { key: "photo_front_path", label: "Framifrån" },
    { key: "photo_back_path", label: "Bakifrån" },
    { key: "photo_left_path", label: "Vänster sida" },
    { key: "photo_right_path", label: "Höger sida" },
  ] as const;

  const withPhotoUrls = await Promise.all(
    (intakes ?? []).map(async (intake) => {
      const photos = await Promise.all(
        PHOTO_FIELDS.map(async ({ key, label }) => {
          const path = intake[key] as string | null;
          if (!path) return null;
          const { data } = await admin.storage
            .from(COACHING_ATTACHMENT_BUCKET)
            .createSignedUrl(path, 3600);
          return data?.signedUrl ? { label, url: data.signedUrl } : null;
        }),
      );
      return {
        ...intake,
        photos: photos.filter(Boolean) as { label: string; url: string }[],
      };
    }),
  );

  return (
      <div className={`wrap ${styles.wrap}`}>
        <Link href="/coaching" className={styles.back}>
          ← Admin
        </Link>
        <span className="eyebrow">Premium Coaching</span>
        <h1>Kom igång-formulär</h1>
        <p
          style={{
            color: "var(--text-soft)",
            fontSize: "0.88rem",
            marginBottom: 24,
          }}
        >
          Svar från nya prenumeranter — allt du behöver för att bygga deras
          skräddarsydda program.
        </p>

        {(!withPhotoUrls || withPhotoUrls.length === 0) && (
          <p className={styles.empty}>Inga inskickade formulär än.</p>
        )}

        <div className={styles.list}>
          {withPhotoUrls.map((intake) => {
            const profile = Array.isArray(intake.profiles)
              ? intake.profiles[0]
              : intake.profiles;
            return (
              <div key={intake.id} className={styles.contactRow}>
                <div className={styles.rowInfo}>
                  <div className={styles.name}>
                    {profile?.display_name || "Namnlös"}{" "}
                    {profile?.email && (
                      <span className={styles.contactEmail}>
                        · {profile.email}
                      </span>
                    )}
                  </div>

                  <div className={styles.contactMessage}>
                    <b>Vill ha hjälp med:</b> {intake.symptoms}
                    {intake.pain_level != null && (
                      <> (smärtnivå {intake.pain_level}/10)</>
                    )}
                  </div>

                  {(intake.height_cm || intake.weight_kg) && (
                    <div className={styles.contactMessage}>
                      <b>Längd/vikt:</b> {intake.height_cm ?? "—"} cm
                      {intake.weight_kg ? `, ${intake.weight_kg} kg` : ""}
                    </div>
                  )}

                  {intake.previous_injuries && (
                    <div className={styles.contactMessage}>
                      <b>Tidigare skador:</b> {intake.previous_injuries}
                    </div>
                  )}

                  {intake.medications && (
                    <div className={styles.contactMessage}>
                      <b>Mediciner/kosttillskott:</b> {intake.medications}
                    </div>
                  )}

                  {intake.sedentary_work && (
                    <div className={styles.contactMessage}>
                      <b>Arbetsergonomi:</b> {intake.sedentary_work}
                    </div>
                  )}

                  {intake.sleep_habits && (
                    <div className={styles.contactMessage}>
                      <b>Sömn:</b> {intake.sleep_habits}
                    </div>
                  )}

                  {intake.current_training && (
                    <div className={styles.contactMessage}>
                      <b>Nuvarande träning:</b> {intake.current_training}
                    </div>
                  )}

                  {intake.equipment_access && (
                    <div className={styles.contactMessage}>
                      <b>Utrustning:</b> {intake.equipment_access}
                    </div>
                  )}

                  {(intake.session_length || intake.weekly_time_budget) && (
                    <div className={styles.contactMessage}>
                      <b>Programtid:</b> {intake.session_length ?? "—"} per
                      pass, {intake.weekly_time_budget ?? "—"} per vecka
                    </div>
                  )}

                  {intake.goals && (
                    <div className={styles.contactMessage}>
                      <b>Mål:</b> {intake.goals}
                    </div>
                  )}

                  {intake.other_info && (
                    <div className={styles.contactMessage}>
                      <b>Övrigt:</b> {intake.other_info}
                    </div>
                  )}

                  {intake.photos.length > 0 && (
                    <div className={styles.contactMessage}>
                      <b>Hållningsfoton:</b>{" "}
                      {intake.photos.map((photo) => (
                        <a
                          key={photo.label}
                          href={photo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginRight: 10 }}
                        >
                          {photo.label}
                        </a>
                      ))}
                    </div>
                  )}

                  <div className={styles.contactDate}>
                    {new Date(intake.submitted_at as string).toLocaleString(
                      "sv-SE",
                      { dateStyle: "short", timeStyle: "short" },
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
}
