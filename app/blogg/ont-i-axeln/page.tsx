import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogPostCard from "@/components/BlogPostCard";
import ArticleByline from "@/components/ArticleByline";
import { pageMetadata } from "@/lib/page-metadata";
import { buildArticleJsonLd } from "@/lib/article-jsonld";
import styles from "../blog-post.module.css";

const TITLE = "Ont i axeln — därför uppstår det och vad som hjälper";
const DESCRIPTION =
  "Axelsmärta och stela, framåtdragna axlar hänger ofta ihop med samma grundorsak. Så uppstår det, och så tränar du upp motståndet.";

export const metadata = pageMetadata({
  title: `${TITLE} — ReAlign Metoden`,
  description: DESCRIPTION,
  image: "/og/default.png",
  path: "/blogg/ont-i-axeln",
});

const articleJsonLd = buildArticleJsonLd({
  title: TITLE,
  description: DESCRIPTION,
  path: "/blogg/ont-i-axeln",
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
          <span className="eyebrow">Axel & hållning</span>
          <h1>Ont i axeln — därför uppstår det och vad som hjälper</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <ArticleByline />
          <p className={styles.lead}>
            Ont i axeln beror sällan på axeln i sig — oftast har den fått
            en framåtdragen, rundad position som bröstmusklerna
            förkortas kring, medan musklerna mellan skulderbladen
            försvagas av att aldrig aktiveras. Extremt vanligt, vanligast
            kopplat till hållning vid skärmarbete, men även ofta av
            sport, ensidig belastning i vardagen eller hur man sover.
            Det är sällan något du behöver leva med, men det kräver rätt
            sorts träning, inte bara stretching.
          </p>
        </header>

        <div className={`img-duo warm ${styles.heroImage}`}>
          <Image
            src="https://images.unsplash.com/photo-1645005512968-0c1fe99f0093?auto=format&fit=crop&w=1200&h=440&q=80&sat=-100&con=6&bri=5"
            alt="Behandling av axeln"
            fill
            sizes="(max-width: 800px) 100vw, 720px"
          />
        </div>

        <div className={styles.article}>
          <div className={styles.ctaBand}>
            <p>
              Hela artikeln — med grundorsaken förklarad, fyra övningar
              med instruktionsvideo och vardagstips — finns hos vår
              klinik i Göteborg, Cleer Klinik.
            </p>
            <a
              className="btn btn-primary"
              href="https://www.cleerklinik.se/blogg/ont-i-axeln"
              target="_blank"
              rel="noopener noreferrer"
            >
              Läs hela artikeln hos Cleer Klinik →
            </a>
          </div>

          <h3 className={styles.relatedHead}>Relaterat</h3>
          <div className={styles.relatedGrid}>
            <BlogPostCard
              slug="ont-i-nacken"
              title="Ont i nacken"
              excerpt="Nacke och axlar hänger ihop via samma kedja — så tränar du bort spänningen."
            />
            <BlogPostCard
              slug="ont-i-ryggen"
              title="Ont i ryggen"
              excerpt="Samma bröstrygg som styr axlarna spelar ofta en stor roll för ryggvärk också."
            />
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
