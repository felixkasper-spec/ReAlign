import Link from "next/link";
import styles from "./GuestAccountPrompt.module.css";

export default function GuestAccountPrompt({
  text = "Spara favoriter, schemalägg pass och håll koll på din progression.",
}: {
  text?: string;
}) {
  return (
    <div className={styles.box}>
      <div className={styles.text}>
        <div className={styles.title}>Skapa ett gratis konto</div>
        <div className={styles.body}>{text} Helt gratis, inget kort krävs.</div>
      </div>
      <Link href="/signup" className={`btn btn-primary ${styles.btn}`}>
        Skapa gratis konto →
      </Link>
    </div>
  );
}
