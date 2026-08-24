import Link from "next/link";
import styles from "./page.module.css";

export default function MobileTabs({
  hasCoaching,
  linkPrefix = "",
  activeCoaching = false,
}: {
  hasCoaching: boolean;
  linkPrefix?: string;
  activeCoaching?: boolean;
}) {
  return (
    <div className={styles.mobileTabs}>
      <a href={`${linkPrefix}#oversikt`}>Översikt</a>
      {hasCoaching && (
        <Link
          href="/min-sida/coaching"
          className={activeCoaching ? styles.mobileTabActive : undefined}
        >
          Chatt med coach
        </Link>
      )}
      <a href={`${linkPrefix}#favoriter`}>Favoriter</a>
      <a href={`${linkPrefix}#schema`}>Schema</a>
      <a href={`${linkPrefix}#progression`}>Progression</a>
    </div>
  );
}
