import Link from "next/link";
import styles from "./page.module.css";

export default function Sidebar({
  firstName,
  userEmail,
  hasCoaching,
  linkPrefix = "",
  activeCoaching = false,
  isCoach = false,
}: {
  firstName?: string | null;
  userEmail?: string | null;
  hasCoaching: boolean;
  linkPrefix?: string;
  activeCoaching?: boolean;
  isCoach?: boolean;
}) {
  return (
    <aside className={styles.sidebar}>
      <Link className={styles.logo} href="/">
        <span className={styles.mark} />
        ReAlign
      </Link>
      <a className={styles.sideLink} href={`${linkPrefix}#oversikt`}>
        <span className={styles.sideIc}>◐</span>Översikt
      </a>
      <a className={styles.sideLink} href={`${linkPrefix}#favoriter`}>
        <span className={styles.sideIc}>♡</span>Favoriter
      </a>
      <a className={styles.sideLink} href={`${linkPrefix}#schema`}>
        <span className={styles.sideIc}>▦</span>Schema
      </a>
      <a className={styles.sideLink} href={`${linkPrefix}#progression`}>
        <span className={styles.sideIc}>↗</span>Progression
      </a>
      {hasCoaching && (
        <Link
          className={`${styles.sideLink} ${activeCoaching ? styles.sideLinkActive : ""}`}
          href="/min-sida/coaching"
        >
          <span className={styles.sideIc}>✉</span>Chatt med coach
        </Link>
      )}
      {isCoach && (
        <Link className={styles.sideLink} href="/coaching">
          <span className={styles.sideIc}>◈</span>Coach-inkorg
        </Link>
      )}
      <div className={styles.sideBottom}>
        <div className={styles.userChip}>
          <span className={styles.avatar}>
            {firstName ? firstName[0].toUpperCase() : "?"}
          </span>
          {firstName ?? userEmail}
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className={styles.signout}>
            Logga ut
          </button>
        </form>
      </div>
    </aside>
  );
}
