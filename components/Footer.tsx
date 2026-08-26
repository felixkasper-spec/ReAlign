import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.linkRow}>
        <Link href="/om-oss">Om oss</Link>
        <Link href="/faq">Vanliga frågor</Link>
        <Link href="/kontakt">Kontakt</Link>
        <Link href="/integritetspolicy">Integritetspolicy</Link>
      </div>
      <div className={styles.footRow}>
        <div className={styles.logo}>
          <span className={styles.mark} />
          ReAlign
        </div>
        <div>© {year} Felix Kasper AB · ReAlign Metoden, skapat av Cleer Klinik</div>
      </div>
    </footer>
  );
}
