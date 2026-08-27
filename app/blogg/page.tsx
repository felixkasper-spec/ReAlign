import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts } from "@/lib/blog-posts";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "./page.module.css";

export const metadata = pageMetadata({
  title: "Blogg — ReAlign Metoden",
  description:
    "Artiklar om postural träning, ergonomi och vanliga orsaker till spänningar och smärta — grundat i Optimum-Metoden.",
  image: "/og/default.png",
  path: "/blogg",
});

export default function BloggIndexPage() {
  const sorted = [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  return (
    <>
      <Header />
      <div className="wrap">
        <header className={styles.pageHead}>
          <span className="eyebrow">Blogg</span>
          <h1>Artiklar om hållning, smärta och ergonomi.</h1>
          <p className={styles.intro}>
            Grundat i Optimum-Metoden — praktiska svar på varför det gör
            ont, och vad som faktiskt hjälper.
          </p>
        </header>

        <div className={styles.list}>
          {sorted.map((post) => (
            <Link key={post.slug} href={`/blogg/${post.slug}`} className={styles.card}>
              <span className={styles.date}>
                {new Date(post.publishedAt).toLocaleDateString("sv-SE", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
            </Link>
          ))}
        </div>

        <Footer />
      </div>
    </>
  );
}
