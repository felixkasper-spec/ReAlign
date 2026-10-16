import Link from "next/link";
import styles from "./GuestAccountPrompt.module.css";

// Visas istället för GuestAccountPrompt när besökaren redan är inloggad (se
// app/p/[token]/page.tsx) — en uppmaning att skapa konto är irrelevant då,
// så det blir en uppgradering till Premium Coaching istället. Återanvänder
// samma CSS-modul som GuestAccountPrompt för att se likadan ut.
export default function PremiumUpsellPrompt() {
  return (
    <div className={styles.box}>
      <div className={styles.text}>
        <div className={styles.title}>Vill du ha fler skräddarsydda program?</div>
        <ul className={styles.list}>
          <li>Skräddarsydda program</li>
          <li>Direktkontakt med en coach</li>
          <li>Ingen bindningstid</li>
        </ul>
        <div className={styles.note}>249 kr/mån.</div>
      </div>
      <Link href="/premium-coaching" className={`btn btn-primary ${styles.btn}`}>
        Läs mer om Premium Coaching →
      </Link>
    </div>
  );
}
