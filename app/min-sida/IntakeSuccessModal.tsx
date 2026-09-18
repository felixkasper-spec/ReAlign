"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function IntakeSuccessModal() {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  function close() {
    setOpen(false);
    // Tar bort ?intake=success ur URL:en så meddelandet inte dyker upp
    // igen om sidan laddas om.
    router.replace("/min-sida", { scroll: false });
  }

  if (!open) return null;

  return (
    <div
      className={styles.intakeModalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label="Formulär inskickat"
      onClick={close}
    >
      <div className={styles.intakeModalBox} onClick={(e) => e.stopPropagation()}>
        <p>
          Tack! Dina svar är sparade — Felix hör av sig när din första
          träningsplan är klar.
        </p>
        <button type="button" className="btn btn-primary" onClick={close}>
          Stäng
        </button>
      </div>
    </div>
  );
}
