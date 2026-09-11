"use client";

import Link from "next/link";
import styles from "./page.module.css";

// Klick på dator ska inte behöva scrolla (allt syns redan samtidigt), men
// då finns ingen visuell bekräftelse på att man faktiskt "gick till" rätt
// avsnitt — flashar därför sektionen med en kort glow istället.
function flashSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove(styles.sectionFlash);
  // Tvingar en reflow så klassen kan läggas till igen och animationen
  // startar om, även om man klickar på samma länk två gånger i rad.
  void el.offsetWidth;
  el.classList.add(styles.sectionFlash);
  window.setTimeout(() => el.classList.remove(styles.sectionFlash), 2200);
}

export default function Sidebar({
  firstName,
  userEmail,
  hasCoaching,
  linkPrefix = "",
  activeCoaching = false,
  isCoach = false,
  isClinicStaff = false,
  canBuildProgram = false,
}: {
  firstName?: string | null;
  userEmail?: string | null;
  hasCoaching: boolean;
  linkPrefix?: string;
  activeCoaching?: boolean;
  isCoach?: boolean;
  isClinicStaff?: boolean;
  canBuildProgram?: boolean;
}) {
  return (
    <aside className={styles.sidebar}>
      <Link className={styles.logo} href="/">
        <span className={styles.mark} />
        ReAlign
      </Link>
      {isClinicStaff && (
        <>
          <Link className={styles.sideLink} href="/coaching/kundprogram">
            <span className={styles.sideIc}>▤</span>Kundprogram
          </Link>
          <Link className={styles.sideLink} href="/coaching/content-studio">
            <span className={styles.sideIc}>◨</span>Content Studio
          </Link>
        </>
      )}
      <a
        className={styles.sideLink}
        href={`${linkPrefix}#oversikt`}
        onClick={() => flashSection("oversikt")}
      >
        <span className={styles.sideIc}>◐</span>Översikt
      </a>
      <a
        className={styles.sideLink}
        href={`${linkPrefix}#favoriter`}
        onClick={() => flashSection("favoriter")}
      >
        <span className={styles.sideIc}>♡</span>Favoriter
      </a>
      <a
        className={styles.sideLink}
        href={`${linkPrefix}#schema`}
        onClick={() => flashSection("schema")}
      >
        <span className={styles.sideIc}>▦</span>Schema
      </a>
      <a
        className={styles.sideLink}
        href={`${linkPrefix}#progression`}
        onClick={() => flashSection("progression")}
      >
        <span className={styles.sideIc}>↗</span>Progression
      </a>
      {canBuildProgram && (
        <a
          className={styles.sideLink}
          href={`${linkPrefix}#mina-program`}
          onClick={() => flashSection("mina-program")}
        >
          <span className={styles.sideIc}>✎</span>Mina program
        </a>
      )}
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
