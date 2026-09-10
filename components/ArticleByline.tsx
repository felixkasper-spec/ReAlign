import Link from "next/link";
import styles from "@/app/blogg/blog-post.module.css";

export default function ArticleByline() {
  return (
    <span className={styles.byline}>
      Skriven av <Link href="/om-oss">Felix Eliasson</Link>, Postural Terapeut
      via Optimum-Metoden
    </span>
  );
}
