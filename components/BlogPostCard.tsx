import Link from "next/link";
import styles from "./BlogPostCard.module.css";

export default function BlogPostCard({
  slug,
  title,
  excerpt,
}: {
  slug: string;
  title: string;
  excerpt: string;
}) {
  return (
    <Link href={`/blogg/${slug}`} className={styles.card}>
      <h4>{title}</h4>
      <p>{excerpt}</p>
    </Link>
  );
}
