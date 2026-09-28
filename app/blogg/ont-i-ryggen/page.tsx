import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogPostCard from "@/components/BlogPostCard";
import ArticleByline from "@/components/ArticleByline";
import { pageMetadata } from "@/lib/page-metadata";
import { buildArticleJsonLd } from "@/lib/article-jsonld";
import styles from "../blog-post.module.css";

const TITLE = "Ont i ryggen — vanligaste orsakerna och vad som hjälper";
const DESCRIPTION =
  "Ryggsmärta sitter sällan bara i ryggen. Så hänger bröstrygg, bäcken och resten av kroppen ihop med ryggvärk, och vilka övningar som faktiskt hjälper.";

export const metadata = pageMetadata({
  title: `${TITLE} — ReAlign Metoden`,
  description: DESCRIPTION,
  image: "/og/default.png",
  path: "/blogg/ont-i-ryggen",
});

const articleJsonLd = buildArticleJsonLd({
  title: TITLE,
  description: DESCRIPTION,
  path: "/blogg/ont-i-ryggen",
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
          <span className="eyebrow">Rygg & hållning</span>
          <h1>Ont i ryggen — vanligaste orsakerna och vad som hjälper</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <ArticleByline />
          <p className={styles.lead}>
            Ryggvärk beror oftast på felbelastning — att ryggen har för
            lite svank, för mycket svank, eller är för krum i
            bröstryggen, vilket gör att vissa delar överarbetar medan
            andra inte gör sitt jobb. Det är en av de vanligaste
            anledningarna till att människor söker hjälp, oavsett om det
            sitter högt mellan skulderbladen eller lågt i ländryggen.
            Här är vad som faktiskt brukar ligga bakom det, och vad som
            hjälper.
          </p>
        </header>

        <div className={`img-duo warm ${styles.heroImage}`}>
          <Image
            src="https://images.unsplash.com/photo-1769029271190-36b22f5e6771?auto=format&fit=crop&w=1200&h=440&q=80&sat=-100&con=6&bri=5"
            alt="Person som håller sig om nedre ryggen av smärta"
            fill
            sizes="(max-width: 800px) 100vw, 720px"
          />
        </div>

        <div className={styles.article}>
          <div className={styles.ctaBand}>
            <p>
              Hela artikeln — med grundorsakerna för både ländrygg och
              bröstrygg förklarade, övningar med instruktionsvideo och
              ergonomitips — finns hos vår klinik i Göteborg, Cleer
              Klinik.
            </p>
            <a
              className="btn btn-primary"
              href="https://www.cleerklinik.se/blogg/ont-i-ryggen"
              target="_blank"
              rel="noopener noreferrer"
            >
              Läs hela artikeln hos Cleer Klinik →
            </a>
          </div>

          <h3 className={styles.relatedHead}>Relaterat</h3>
          <div className={styles.relatedGrid}>
            <BlogPostCard
              slug="ont-i-landryggen"
              title="Ont i ländryggen"
              excerpt="Vanligaste orsakerna till att just nedre ryggen gör ont, och vilka övningar som bygger upp stödet."
            />
            <BlogPostCard
              slug="ont-i-nacken"
              title="Ont i nacken"
              excerpt="Samma kedja, ett annat ställe där obalansen märks — så tränar du bort nackspänningen."
            />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
