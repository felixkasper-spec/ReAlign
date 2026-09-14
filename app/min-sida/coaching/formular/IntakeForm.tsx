"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createAttachmentUploadUrl } from "../../actions";
import {
  COACHING_ATTACHMENT_BUCKET,
  MAX_ATTACHMENT_BYTES,
} from "@/lib/coaching-attachments";
import { submitCoachingIntake } from "./actions";
import shellStyles from "../../page.module.css";
import styles from "./page.module.css";

type Intake = {
  height_cm: number | null;
  weight_kg: number | null;
  symptoms: string;
  pain_level: number | null;
  previous_injuries: string | null;
  medications: string | null;
  sedentary_work: string | null;
  sleep_habits: string | null;
  current_training: string | null;
  equipment_access: string | null;
  session_length: string | null;
  weekly_time_budget: string | null;
  goals: string | null;
  other_info: string | null;
  photo_paths: string[];
} | null;

export default function IntakeForm({ intake }: { intake: Intake }) {
  const [hasProblem, setHasProblem] = useState(true);
  const [photos, setPhotos] = useState<File[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setError(null);

    for (const f of files) {
      if (!f.type.startsWith("image/")) {
        setError("Bara bilder kan bifogas här.");
        e.target.value = "";
        return;
      }
      if (f.size > MAX_ATTACHMENT_BYTES) {
        setError("En bild är för stor (max 25 MB).");
        e.target.value = "";
        return;
      }
    }

    setPhotos((prev) => [...prev, ...files]);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;

    setPending(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      const uploadedPaths: string[] = [];

      for (const file of photos) {
        const { path, token } = await createAttachmentUploadUrl(
          file.name,
          file.size,
          file.type,
        );
        const { error: uploadError } = await supabase.storage
          .from(COACHING_ATTACHMENT_BUCKET)
          .uploadToSignedUrl(path, token, file);
        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
      }

      const formData = new FormData(formRef.current);
      const result = await submitCoachingIntake(
        [...(intake?.photo_paths ?? []), ...uploadedPaths],
        formData,
      );

      if (result.ok) {
        setSuccess(true);
        setPhotos([]);
      } else {
        setError(result.error ?? "Något gick fel, försök igen.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Något gick fel, försök igen.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
      {success && (
        <p className={styles.success}>
          Tack! Dina svar är sparade — Felix hör av sig när ditt program är
          klart.
        </p>
      )}
      {error && <p className={styles.error}>{error}</p>}

      <section className={shellStyles.panel}>
        <div className={shellStyles.panelHead}>
          <h2>Om dig</h2>
        </div>
        <div className={styles.row}>
          <label className={styles.field}>
            Längd (cm)
            <input
              type="number"
              name="height_cm"
              min={100}
              max={230}
              defaultValue={intake?.height_cm ?? ""}
              className={shellStyles.textInput}
            />
          </label>
          <label className={styles.field}>
            Vikt (kg) — valfritt
            <input
              type="number"
              name="weight_kg"
              min={30}
              max={250}
              defaultValue={intake?.weight_kg ?? ""}
              className={shellStyles.textInput}
            />
          </label>
        </div>
      </section>

      <section className={shellStyles.panel}>
        <div className={shellStyles.panelHead}>
          <h2>Vad vill du ha hjälp med?</h2>
        </div>
        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="has_problem"
              value="ja"
              checked={hasProblem}
              onChange={() => setHasProblem(true)}
            />
            Jag har smärta eller ett specifikt problem
          </label>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="has_problem"
              value="nej"
              checked={!hasProblem}
              onChange={() => setHasProblem(false)}
            />
            Jag har inget specifikt problem — jag vill bara träna för bättre
            form, hållning eller känna mig lättare i kroppen
          </label>
        </div>

        {hasProblem ? (
          <>
            <p className={styles.help}>
              Beskriv i fri text. Har du flera problem? Skriv om det du helst
              vill bli av med först, fortsätt sedan i fallande ordning. Skriv
              gärna om: vart på kroppen det sitter, när det började, om det kom
              av ett trauma eller &quot;oprovocerat&quot;, när på dygnet/efter
              vilka aktiviteter det är som värst, och om du fått en diagnos.
            </p>
            <textarea
              name="symptoms"
              required
              rows={5}
              defaultValue={intake?.symptoms ?? ""}
              className={styles.textarea}
              placeholder="Fyll i ditt svar här..."
            />
            <label className={styles.field}>
              Hur mycket stör problemet dig en genomsnittlig dag? (1–10)
              <input
                type="number"
                name="pain_level"
                min={1}
                max={10}
                defaultValue={intake?.pain_level ?? ""}
                className={shellStyles.textInput}
              />
            </label>
          </>
        ) : (
          <>
            <p className={styles.help}>
              Beskriv gärna vad du vill uppnå — t.ex. bättre form, bättre
              hållning, mer styrka eller att känna dig lättare i kroppen.
            </p>
            <textarea
              name="symptoms"
              required
              rows={4}
              defaultValue={intake?.symptoms ?? ""}
              className={styles.textarea}
              placeholder="Fyll i ditt svar här..."
            />
          </>
        )}
      </section>

      <section className={shellStyles.panel}>
        <div className={shellStyles.panelHead}>
          <h2>Historik</h2>
        </div>
        <label className={styles.field}>
          Tidigare skador eller operationer, utöver det aktuella problemet
          <textarea
            name="previous_injuries"
            rows={3}
            defaultValue={intake?.previous_injuries ?? ""}
            className={styles.textarea}
            placeholder="Fyll i ditt svar här..."
          />
        </label>
        <label className={styles.field}>
          Mediciner eller kosttillskott som kan påverka träning eller
          återhämtning
          <textarea
            name="medications"
            rows={2}
            defaultValue={intake?.medications ?? ""}
            className={styles.textarea}
            placeholder="Fyll i ditt svar här..."
          />
        </label>
      </section>

      <section className={shellStyles.panel}>
        <div className={shellStyles.panelHead}>
          <h2>Vardag</h2>
        </div>
        <label className={styles.field}>
          Har du några monotona arbetsuppgifter? T.ex. mycket sittande, stående,
          framåtböjt, eller att du vrider dig åt ena hållet ofta.
          <textarea
            name="sedentary_work"
            rows={3}
            defaultValue={intake?.sedentary_work ?? ""}
            className={styles.textarea}
            placeholder="Fyll i ditt svar här..."
          />
        </label>
        <label className={styles.field}>
          Sömnvanor — valfritt
          <textarea
            name="sleep_habits"
            rows={2}
            defaultValue={intake?.sleep_habits ?? ""}
            className={styles.textarea}
            placeholder="Fyll i ditt svar här..."
          />
        </label>
      </section>

      <section className={shellStyles.panel}>
        <div className={shellStyles.panelHead}>
          <h2>Träning</h2>
        </div>
        <label className={styles.field}>
          Vad gör du i träningsväg idag, och hur ofta en vanlig vecka?
          <textarea
            name="current_training"
            rows={3}
            defaultValue={intake?.current_training ?? ""}
            className={styles.textarea}
            placeholder="Fyll i ditt svar här..."
          />
        </label>
        <label className={styles.field}>
          Tillgång till utrustning — t.ex. gym, hemmagym, endast kroppsvikt
          <textarea
            name="equipment_access"
            rows={2}
            defaultValue={intake?.equipment_access ?? ""}
            className={styles.textarea}
            placeholder="Fyll i ditt svar här..."
          />
        </label>
        <label className={styles.field}>
          Hur lång tid kan ett träningspass ta att utföra? Välj mellan 10, 15,
          30, 45 eller 60 minuter.
          <input
            type="text"
            name="session_length"
            defaultValue={intake?.session_length ?? ""}
            className={shellStyles.textInput}
            placeholder="t.ex. 30 minuter"
          />
        </label>
        <label className={styles.field}>
          Hur mycket tid totalt kan du lägga på träningen per vecka?
          <input
            type="text"
            name="weekly_time_budget"
            defaultValue={intake?.weekly_time_budget ?? ""}
            className={shellStyles.textInput}
            placeholder="t.ex. 2-3 timmar"
          />
        </label>
      </section>

      <section className={shellStyles.panel}>
        <div className={shellStyles.panelHead}>
          <h2>Mål</h2>
        </div>
        <label className={styles.field}>
          Vad vill du ha uppnått om 3–6 månader?
          <textarea
            name="goals"
            rows={3}
            defaultValue={intake?.goals ?? ""}
            className={styles.textarea}
            placeholder="Fyll i ditt svar här..."
          />
        </label>
      </section>

      <section className={shellStyles.panel}>
        <div className={shellStyles.panelHead}>
          <h2>Hållningsfoton</h2>
        </div>
        <p className={styles.help}>
          Ladda gärna upp 2–3 bilder (framifrån, bakifrån, från sidan) i
          vanliga, åtsittande kläder, stående avslappnat. Hjälper Felix göra en
          hållningsanalys inför ditt program.
        </p>
        <div className={styles.photoGrid}>
          {[...(intake?.photo_paths ?? [])].map((path) => (
            <div key={path} className={styles.photoChipExisting}>
              Tidigare uppladdad bild
            </div>
          ))}
          {photos.map((file, i) => (
            <div key={`${file.name}-${i}`} className={styles.photoChip}>
              <span>{file.name}</span>
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label="Ta bort bild"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handlePhotoChange}
          className={styles.fileInput}
          id="intake-photos"
        />
        <label htmlFor="intake-photos" className="btn btn-ghost">
          + Lägg till bilder
        </label>
      </section>

      <section className={shellStyles.panel}>
        <div className={shellStyles.panelHead}>
          <h2>Övrigt</h2>
        </div>
        <label className={styles.field}>
          Något mer du tror kan vara relevant för oss att veta?
          <textarea
            name="other_info"
            rows={3}
            defaultValue={intake?.other_info ?? ""}
            className={styles.textarea}
            placeholder="Fyll i ditt svar här..."
          />
        </label>
      </section>

      <button
        type="submit"
        className="btn btn-primary btn-lg"
        disabled={pending}
      >
        {pending ? "Sparar..." : "Skicka in"}
      </button>
    </form>
  );
}
