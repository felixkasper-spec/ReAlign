import Link from "next/link";
import styles from "./GuestAccountPrompt.module.css";

export default function GuestAccountPrompt({ href = "/signup" }: { href?: string }) {
  return (
    <div className={styles.box}>
      <div className={styles.text}>
        <div className={styles.title}>Skapa ett gratis konto</div>
        <ul className={styles.list}>
          <li>Spara program</li>
          <li>Spara favoritövningar</li>
          <li>Schemalägg pass</li>
          <li>Se din historik</li>
        </ul>
        <div className={styles.note}>Helt gratis, inget kort krävs.</div>
      </div>
      <Link href={href} className={`btn btn-primary ${styles.btn}`}>
        Skapa gratis konto →
      </Link>
    </div>
  );
}
