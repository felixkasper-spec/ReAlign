import styles from "./ScrollCue.module.css";

export default function ScrollCue({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <a href={href} aria-label={label} className={`${styles.cue} ${className ?? ""}`}>
      ↓
    </a>
  );
}
