import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogPostCard from "@/components/BlogPostCard";
import ArticleByline from "@/components/ArticleByline";
import { pageMetadata } from "@/lib/page-metadata";
import { buildArticleJsonLd } from "@/lib/article-jsonld";
import styles from "../blog-post.module.css";

const TITLE = "Ont i ländryggen — vanligaste orsakerna och vad som hjälper";
const DESCRIPTION =
  "Ländryggens ytliga muskler har ofta fått en hållningsroll de inte är byggda för. Varför det händer, och vilka övningar som faktiskt bygger upp rätt stöd.";

export const metadata = pageMetadata({
  title: `${TITLE} — ReAlign Metoden`,
  description: DESCRIPTION,
  image: "/og/default.png",
  path: "/blogg/ont-i-landryggen",
});

const articleJsonLd = buildArticleJsonLd({
  title: TITLE,
  description: DESCRIPTION,
  path: "/blogg/ont-i-landryggen",
  datePublished: "2026-08-27",
});

export default function BlogPost() {
  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Ländrygg & hållning</span>
          <h1>Ont i ländryggen — vanligaste orsakerna och vad som hjälper</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <ArticleByline />
          <p className={styles.lead}>
            Ont i ländryggen beror oftast på att dess ytliga muskler
            tvingas in i en hållningsroll de inte är byggda för, när
            andra delar av kroppen inte gör sitt jobb och ländryggen får
            kompensera dag efter dag. En dov värk där är en av de
            vanligaste anledningarna till att människor söker hjälp —
            och lösningen ligger sällan i själva ländryggen, utan i vad
            den kompenserar för.
          </p>
        </header>

        <div className={`img-duo warm ${styles.heroImage}`}>
          <Image
            src="https://images.unsplash.com/photo-1769029271190-36b22f5e6771?auto=format&fit=crop&w=1200&h=700&q=80&sat=-100&con=6&bri=5"
            alt="Person som håller sig i nedre ryggen av smärta"
            fill
            sizes="(max-width: 800px) 100vw, 720px"
          />
        </div>

        <div className={styles.article}>
          <div className={styles.ctaBand}>
            <p>
              Hela artikeln — med grundorsaken förklarad, fem övningar med
              instruktionsvideo och ergonomitips — finns hos vår klinik i
              Göteborg, Cleer Klinik.
            </p>
            <a
              className="btn btn-primary"
              href="https://www.cleerklinik.se/blogg/ont-i-landryggen"
              target="_blank"
              rel="noopener noreferrer"
            >
              Läs hela artikeln hos Cleer Klinik →
            </a>
          </div>

          <h3 className={styles.relatedHead}>Relaterat</h3>
          <div className={styles.relatedGrid}>
            <BlogPostCard
              slug="ont-i-ryggen"
              title="Ont i ryggen"
              excerpt="Ländryggen är ofta bara där det märks — så hänger bröstrygg och resten av kedjan ihop med ryggvärk."
            />
            <BlogPostCard
              slug="ont-i-nacken"
              title="Ont i nacken"
              excerpt="Nackspänning och ländryggssmärta hänger ofta ihop via samma kedja."
            />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
