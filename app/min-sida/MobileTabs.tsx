import Link from "next/link";
import styles from "./page.module.css";

export default function MobileTabs({
  hasCoaching,
  linkPrefix = "",
  activeCoaching = false,
  activeFormular = false,
  isCoach = false,
  isClinicStaff = false,
  canBuildProgram = false,
}: {
  hasCoaching: boolean;
  linkPrefix?: string;
  activeCoaching?: boolean;
  activeFormular?: boolean;
  isCoach?: boolean;
  isClinicStaff?: boolean;
  canBuildProgram?: boolean;
}) {
  return (
    <div className={styles.mobileTabs}>
      {isClinicStaff && (
        <Link href="/coaching/kundprogram">Kundprogram</Link>
      )}
      <a href={`${linkPrefix}#oversikt`}>Översikt</a>
      {hasCoaching && (
        <Link
          href="/min-sida/coaching"
          className={activeCoaching ? styles.mobileTabActive : undefined}
        >
          Chatt med coach
        </Link>
      )}
      {hasCoaching && (
        <Link
          href="/min-sida/coaching/formular"
          className={activeFormular ? styles.mobileTabActive : undefined}
        >
          Kom igång-formulär
        </Link>
      )}
      <a href={`${linkPrefix}#favoriter`}>Favoriter</a>
      <a href={`${linkPrefix}#schema`}>Schema</a>
      <a href={`${linkPrefix}#progression`}>Progression</a>
      {canBuildProgram && (
        <a href={`${linkPrefix}#mina-program`}>Mina program</a>
      )}
      {isCoach && <Link href="/coaching">Admin</Link>}
    </div>
  );
}
