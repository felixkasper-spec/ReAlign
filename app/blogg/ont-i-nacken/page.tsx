import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogPostCard from "@/components/BlogPostCard";
import ArticleByline from "@/components/ArticleByline";
import { pageMetadata } from "@/lib/page-metadata";
import { buildArticleJsonLd } from "@/lib/article-jsonld";
import styles from "../blog-post.module.css";

const TITLE = "Ont i nacken — så tränar du bort det";
const DESCRIPTION =
  "Varför nacken gör ont i första hand — vanligast kopplat till stillasittande, men inte bara det — och fem konkreta övningar som faktiskt gör skillnad.";

export const metadata = pageMetadata({
  title: `${TITLE} — ReAlign Metoden`,
  description: DESCRIPTION,
  image: "/og/default.png",
  path: "/blogg/ont-i-nacken",
});

const articleJsonLd = buildArticleJsonLd({
  title: TITLE,
  description: DESCRIPTION,
  path: "/blogg/ont-i-nacken",
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
          <span className="eyebrow">Nacke & hållning</span>
          <h1>Ont i nacken — så tränar du bort det</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <ArticleByline />
          <p className={styles.lead}>
            Ont i nacken beror sällan på att nackens muskler i sig är
            svaga — oftast har nacken hamnat i en hållningsroll den inte
            är byggd för och tvingas hålla uppe huvudet helt på egen
            hand. Vanligast utlöst av långa dagar framför en skärm, men
            långt ifrån bara då. Den goda nyheten: det går nästan alltid
            att träna bort, om man förstår varför det uppstår i första
            hand.
          </p>
        </header>

        <div className={`img-duo warm ${styles.heroImage}`}>
          <Image
            src="https://images.unsplash.com/photo-1723201964235-ea5b99b55d17?auto=format&fit=crop&w=1200&h=700&q=80&sat=-100&con=6&bri=5"
            alt="Person som sitter framåtlutad vid ett skrivbord"
            fill
            sizes="(max-width: 800px) 100vw, 720px"
          />
        </div>

        <div className={styles.article}>
          <div className={styles.ctaBand}>
            <p>
              Hela artikeln — med grundorsaken förklarad, fem konkreta
              övningar med instruktionsvideo och ergonomitips — finns hos
              vår klinik i Göteborg, Cleer Klinik.
            </p>
            <a
              className="btn btn-primary"
              href="https://www.cleerklinik.se/blogg/ont-i-nacken"
              target="_blank"
              rel="noopener noreferrer"
            >
              Läs hela artikeln hos Cleer Klinik →
            </a>
          </div>

          <h3 className={styles.relatedHead}>Relaterat</h3>
          <div className={styles.relatedGrid}>
            <BlogPostCard
              slug="ont-i-axeln"
              title="Ont i axeln"
              excerpt="Rundade, framåtdragna axlar — därför uppstår det och vad som bygger upp motståndet."
            />
            <BlogPostCard
              slug="ont-i-ryggen"
              title="Ont i ryggen"
              excerpt="Samma bröstrygg som styr nacken spelar ofta en stor roll för ryggvärk också."
            />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
