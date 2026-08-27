import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pageMetadata } from "@/lib/page-metadata";
import styles from "../blog-post.module.css";

export const metadata = pageMetadata({
  title: "Ont i axlarna vid skrivbordsarbete — därför uppstår det — ReAlign Metoden",
  description:
    "Rundade, framåtdragna axlar är en av de vanligaste följderna av skärmarbete. Så uppstår det, och så tränar du upp motståndet.",
  image: "/og/default.png",
  path: "/blogg/ont-i-axlarna-skrivbordsarbete",
});

export default function BlogPost() {
  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <header className={styles.pageHead}>
          <span className="eyebrow">Axlar & skrivbordsarbete</span>
          <h1>Ont i axlarna vid skrivbordsarbete — därför uppstår det</h1>
          <span className={styles.date}>27 augusti 2026</span>
          <p className={styles.lead}>
            Rundade, framåtdragna axlar efter en arbetsdag är extremt
            vanligt hos den som sitter mycket vid tangentbord och mus. Det
            är inget du behöver leva med — men det kräver rätt sorts
            träning, inte bara stretching.
          </p>
        </header>

        <div className={styles.article}>
          <h2>Varför blir axlarna spända och framåtdragna?</h2>
          <p>
            När du sitter framåtlutad mot en skärm dras axlarna med
            framåt och uppåt, timme efter timme. Bröstmusklerna
            förkortas gradvis, medan musklerna mellan skulderbladen —
            de som ska dra axlarna bakåt och hålla dem i rätt position —
            försvagas av att aldrig aktiveras. Resultatet blir en obalans
            där axlarna &quot;vilar&quot; i en framåtrullad position även när du
            inte sitter vid skärmen.
          </p>
          <p>
            Att bara stretcha bröstet hjälper tillfälligt, men löser
            sällan problemet — det som saknas är styrka i motpartens
            muskler, de som ska hålla axlarna på plats.
          </p>

          <h2>Vad som faktiskt bygger upp motståndet</h2>
          <ol>
            <li>
              <b>Axelrullningar.</b> Enkelt att göra flera gånger om dagen,
              motverkar att axlarna gradvis kryper framåt. Se{" "}
              <Link href="/ovningsbank/standing-shoulder-rolls">
                Standing Shoulder Rolls
              </Link>
              .
            </li>
            <li>
              <b>Axellyft (shrugs).</b> Stärker den övre delen av
              skulderbladens stödmuskulatur. Se{" "}
              <Link href="/ovningsbank/standing-shoulder-shrugs">
                Standing Shoulder Shrugs
              </Link>
              .
            </li>
            <li>
              <b>Bröststretch, en arm i taget.</b> Löser upp det som
              förkortats av framåtlutad sittställning. Se{" "}
              <Link href="/ovningsbank/standing-one-arm-chest-stretch">
                Standing One Arm Chest Stretch
              </Link>
              .
            </li>
            <li>
              <b>Posturala armhävningar.</b> Bygger styrka genom hela
              axelpartiet med fokus på hållning, inte bara bröstet. Se{" "}
              <Link href="/ovningsbank/postural-pushups">
                Postural Pushups
              </Link>
              .
            </li>
            <li>
              <b>Skärmhöjd i ögonhöjd.</b> Om skärmen sitter för lågt lutar
              du dig framåt hela dagen utan att märka det — se vår{" "}
              <Link href="/ergonomi">ergonomiguide</Link> för hur du ställer
              in arbetsplatsen rätt.
            </li>
          </ol>

          <div className={styles.ctaBand}>
            <p>Ett komplett, gratis program för just axlar och skulderblad:</p>
            <Link
              className="btn btn-primary"
              href="/program/axlar-nacke-skulderblad-niva-1"
            >
              Testa Axlar/nacke/skulderblad — Nivå 1, gratis →
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
