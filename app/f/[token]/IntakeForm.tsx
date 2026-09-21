"use client";

import { useRef, useState } from "react";
import { submitIntake } from "./actions";
import styles from "./page.module.css";

type Intake = {
  customer_name: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  symptoms: string | null;
  pain_level: number | null;
  previous_injuries: string | null;
  medications: string | null;
  sedentary_work: string | null;
  sleep_habits: string | null;
  current_training: string | null;
  equipment_access: string | null;
  session_length: string | null;
  goals: string | null;
  other_info: string | null;
};

type ProblemEntry = { text: string; painLevel: string };

export default function IntakeForm({ token, intake }: { token: string; intake: Intake }) {
  const [hasProblem, setHasProblem] = useState(true);
  const [problems, setProblems] = useState<ProblemEntry[]>([
    {
      text: intake.symptoms ?? "",
      painLevel: intake.pain_level != null ? String(intake.pain_level) : "",
    },
  ]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function updateProblemText(index: number, value: string) {
    setProblems((prev) => prev.map((p, i) => (i === index ? { ...p, text: value } : p)));
  }

  function updateProblemPain(index: number, value: string) {
    setProblems((prev) => prev.map((p, i) => (i === index ? { ...p, painLevel: value } : p)));
  }

  function addProblem() {
    setProblems((prev) => [...prev, { text: "", painLevel: "" }]);
  }

  function removeProblem(index: number) {
    setProblems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;

    setPending(true);
    setError(null);

    try {
      const formData = new FormData(formRef.current);

      if (hasProblem) {
        const joined = problems
          .map((p) => ({ text: p.text.trim(), painLevel: p.painLevel.trim() }))
          .filter((p) => p.text)
          .map((p, i) => {
            const painSuffix = p.painLevel ? ` (störningsgrad ${p.painLevel}/10)` : "";
            return `Problem ${i + 1}${painSuffix}: ${p.text}`;
          })
          .join("\n\n");
        formData.set("symptoms", joined);
      }

      const result = await submitIntake(token, formData);

      if (result.ok) {
        setSuccess(true);
        return;
      }
      setError(result.error ?? "Något gick fel, försök igen.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel, försök igen.");
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <div className={styles.panel}>
        <h2>Tack!</h2>
        <p>Dina svar är sparade. Vi hör av oss om vi har fler frågor.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Om dig</h2>
        </div>
        <label className={styles.field}>
          Namn
          <input
            type="text"
            name="customer_name"
            defaultValue={intake.customer_name ?? ""}
            required
            className={styles.textInput}
          />
        </label>
        <div className={styles.row}>
          <label className={styles.field}>
            Längd (cm)
            <input
              type="number"
              name="height_cm"
              min={100}
              max={230}
              defaultValue={intake.height_cm ?? ""}
              className={styles.numberInput}
            />
          </label>
          <label className={styles.field}>
            Vikt (kg) — valfritt
            <input
              type="number"
              name="weight_kg"
              min={30}
              max={250}
              defaultValue={intake.weight_kg ?? ""}
              className={styles.numberInput}
            />
          </label>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
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
              Beskriv i fri text. Skriv gärna om: vart på kroppen det sitter,
              när det började, om det kom av ett trauma eller
              &quot;oprovocerat&quot;, när på dygnet/efter vilka aktiviteter det
              är som värst, och om du fått en diagnos.
            </p>
            {problems.map((problem, i) => (
              <div key={i} className={styles.problemBlock}>
                <label className={styles.field}>
                  Problem {i + 1}
                  {i === 0 && problems.length > 1 ? " (viktigast)" : ""}
                  <textarea
                    value={problem.text}
                    onChange={(e) => updateProblemText(i, e.target.value)}
                    required={i === 0}
                    rows={4}
                    className={styles.textarea}
                    placeholder="Fyll i ditt svar här..."
                  />
                </label>
                <label className={styles.field}>
                  Hur mycket stör detta dig en genomsnittlig dag? (1–10)
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={problem.painLevel}
                    onChange={(e) => updateProblemPain(i, e.target.value)}
                    className={styles.numberInput}
                  />
                </label>
                {problems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProblem(i)}
                    className={styles.removeProblem}
                  >
                    Ta bort problem {i + 1}
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addProblem}
              className="btn btn-ghost"
              style={{ alignSelf: "flex-start" }}
            >
              + Lägg till ett problem
            </button>
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
              defaultValue={intake.symptoms ?? ""}
              className={styles.textarea}
              placeholder="Fyll i ditt svar här..."
            />
          </>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Historik</h2>
        </div>
        <label className={styles.field}>
          Tidigare skador eller operationer, utöver det aktuella problemet
          <textarea
            name="previous_injuries"
            rows={3}
            defaultValue={intake.previous_injuries ?? ""}
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
            defaultValue={intake.medications ?? ""}
            className={styles.textarea}
            placeholder="Fyll i ditt svar här..."
          />
        </label>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Vardag</h2>
        </div>
        <label className={styles.field}>
          Har du några monotona arbetsuppgifter? T.ex. mycket sittande,
          stående, framåtböjt, eller att du vrider dig åt ena hållet ofta.
          <textarea
            name="sedentary_work"
            rows={3}
            defaultValue={intake.sedentary_work ?? ""}
            className={styles.textarea}
            placeholder="Fyll i ditt svar här..."
          />
        </label>
        <label className={styles.field}>
          Sömnvanor — valfritt
          <textarea
            name="sleep_habits"
            rows={2}
            defaultValue={intake.sleep_habits ?? ""}
            className={styles.textarea}
            placeholder="Fyll i ditt svar här..."
          />
        </label>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Träning</h2>
        </div>
        <label className={styles.field}>
          Vad gör du i träningsväg idag, och hur ofta en vanlig vecka?
          <textarea
            name="current_training"
            rows={3}
            defaultValue={intake.current_training ?? ""}
            className={styles.textarea}
            placeholder="Fyll i ditt svar här..."
          />
        </label>
        <label className={styles.field}>
          Tillgång till utrustning — t.ex. gym, hemmagym, endast kroppsvikt
          <textarea
            name="equipment_access"
            rows={2}
            defaultValue={intake.equipment_access ?? ""}
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
            defaultValue={intake.session_length ?? ""}
            className={styles.textInput}
            placeholder="t.ex. 30 minuter"
          />
        </label>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Mål</h2>
        </div>
        <label className={styles.field}>
          Vad vill du ha uppnått om 3–6 månader?
          <textarea
            name="goals"
            rows={3}
            defaultValue={intake.goals ?? ""}
            className={styles.textarea}
            placeholder="Fyll i ditt svar här..."
          />
        </label>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Övrigt</h2>
        </div>
        <label className={styles.field}>
          Något mer du tror kan vara relevant för oss att veta?
          <textarea
            name="other_info"
            rows={3}
            defaultValue={intake.other_info ?? ""}
            className={styles.textarea}
            placeholder="Fyll i ditt svar här..."
          />
        </label>
      </section>

      <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
        {pending ? "Sparar..." : "Skicka in"}
      </button>
    </form>
  );
}
