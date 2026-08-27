import Image from "next/image";
import Link from "next/link";
import { hasThumbnail } from "@/app/ovningsbank/thumbnails";
import styles from "./BlogExerciseCard.module.css";

export default function BlogExerciseCard({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  return (
    <Link href={`/ovningsbank/${slug}`} className={styles.card}>
      {hasThumbnail(slug) ? (
        <div className={`img-duo ${styles.thumb}`}>
          <Image src={`/exercises/${slug}.jpg`} alt={title} fill sizes="72px" />
        </div>
      ) : (
        <div className={styles.thumb}>▶</div>
      )}
      <span className={styles.title}>{title}</span>
    </Link>
  );
}
