"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { getRecommendation, type ResolvedRecommendation } from "./actions";
import type { QuizAnswers } from "@/lib/personalize";
import styles from "./page.module.css";

type Question = {
  name: keyof QuizAnswers;
  question: string;
  options: { value: string; label: string }[];
};

const questions: Question[] = [
  {
    name: "pain",
    question: "Var känns det mest just nu?",
    options: [
      { value: "nacke", label: "Nacke, axlar & skulderblad" },
      { value: "rygg", label: "Rygg" },
      { value: "hoft", label: "Höft & bäcken" },
      { value: "helkropp", label: "Hela kroppen / vet inte riktigt" },
    ],
  },
  {
    name: "lifestyle",
    question: "Hur ser din vardag ut mest av tiden?",
    options: [
      { value: "stillasittande", label: "Mycket stillasittande / kontorsjobb" },
      { value: "aktiv", label: "Aktiv, rör mig redan en del" },
      { value: "blandat", label: "Blandat" },
    ],
  },
  {
    name: "experience",
    question: "Hur van är du vid postural träning sedan innan?",
    options: [
      { value: "ny", label: "Helt ny på det här" },
      { value: "bekvam", label: "Har tränat ett tag, känner mig ganska bekväm" },
      { value: "erfaren", label: "Erfaren, vill utmanas" },
    ],
  },
  {
    name: "equipment",
    question: "Vilken utrustning har du tillgång till?",
    options: [
      { value: "ingen", label: "Inget alls, bara golvet" },
      { value: "hemma", label: "Hemma med enkla saker (stol, vägg)" },
      { value: "gym", label: "Gym" },
    ],
  },
  {
    name: "time",
    question: "Hur mycket tid vill du lägga per pass?",
    options: [
      { value: "kort", label: "Kort (10–15 min)" },
      { value: "medel", label: "Medel (20–30 min)" },
      { value: "fullt", label: "Så mycket som behövs" },
    ],
  },
];

export default function QuizClient() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [result, setResult] = useState<ResolvedRecommendation | null>(null);
  const [isPending, startTransition] = useTransition();

  const q = questions[current];
  const answered = q ? Boolean(answers[q.name]) : false;

  function selectOption(value: string) {
    setAnswers((prev) => ({ ...prev, [q.name]: value }));
  }

  function next() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      startTransition(async () => {
        const rec = await getRecommendation(answers as QuizAnswers);
        setResult(rec);
      });
    }
  }

  function back() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  function restart() {
    setAnswers({});
    setResult(null);
    setCurrent(0);
  }

  if (result) {
    return (
      <div className={styles.resultWrap}>
        <div className={styles.resultHead}>
          <span className="eyebrow">Din rekommendation</span>
          <h2>{result.headline}</h2>
        </div>

        {result.comboNote && (
          <div className={`${styles.noteBox} ${styles.comboNote}`}>
            {result.comboNote}
          </div>
        )}

        {result.steps.map((step, i) => (
          <div className={styles.stepCard} key={`${step.slug}-${i}`}>
            <span className={styles.stepNum}>{i + 1}</span>
            <p>
              <b>{step.title}</b>{" "}
              <span
                className={`${styles.badge} ${
                  step.tier === "premium" ? styles.premium : styles.free
                }`}
              >
                {step.tier === "premium" ? "Premium" : "Gratis"}
              </span>
              <br />
              {step.note}
            </p>
          </div>
        ))}

        {result.progressionNote && (
          <div className={styles.noteBox}>{result.progressionNote}</div>
        )}

        <div className={styles.linkRow}>
          {result.steps
            .filter((s, i, arr) => arr.findIndex((x) => x.slug === s.slug) === i)
            .map((step) => (
              <Link
                key={step.slug}
                className="btn btn-primary"
                href={`/program/${step.slug}`}
              >
                Öppna {step.title} →
              </Link>
            ))}
        </div>

        <div className={styles.restart}>
          <button type="button" onClick={restart}>
            Börja om →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.progressTrack}>
        {questions.map((_, i) => (
          <div
            key={i}
            className={`${styles.progressSeg} ${i <= current ? styles.done : ""}`}
          />
        ))}
      </div>

      <div className={styles.qCard}>
        <div className={styles.qNum}>
          Fråga {current + 1} av {questions.length}
        </div>
        <h2>{q.question}</h2>
        {q.options.map((opt) => (
          <div
            key={opt.value}
            className={`${styles.opt} ${
              answers[q.name] === opt.value ? styles.selected : ""
            }`}
            onClick={() => selectOption(opt.value)}
          >
            <span className={styles.dot3} />
            <span>{opt.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.qNav}>
        <button
          type="button"
          className="btn btn-ghost"
          style={{
            border: "1px solid var(--line)",
            visibility: current === 0 ? "hidden" : "visible",
          }}
          onClick={back}
        >
          ← Tillbaka
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={!answered || isPending}
          onClick={next}
        >
          {isPending
            ? "Räknar ut..."
            : current === questions.length - 1
              ? "Se mitt program →"
              : "Nästa →"}
        </button>
      </div>
    </div>
  );
}
