import Link from "next/link";
import styles from "../auth.module.css";
import { signup } from "./actions";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata({
  title: "Skapa konto — ReAlign Metoden",
  description: "Skapa ett gratis konto för att spara favoriter och schemalägga din träning.",
  image: "/og/default.png",
  path: "/signup",
});

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; source?: string; ref?: string }>;
}) {
  const { error, success, source, ref } = await searchParams;

  if (success) {
    return (
      <div className={styles.wrap}>
        <div className={styles.card}>
          <span className="eyebrow">Kom igång</span>
          <h1>Kolla din inkorg</h1>
          <div className={styles.success}>
            Nästan klart! Kolla din inkorg och klicka på bekräftelselänken vi
            skickat till dig.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <span className="eyebrow">Kom igång</span>
        <h1>Skapa gratis konto</h1>
        <p>Spara favoriter och schemalägg din träning — helt gratis.</p>

        {error && <div className={styles.error}>{error}</div>}

        <form action={signup}>
          {source && <input type="hidden" name="source" value={source} />}
          {ref && <input type="hidden" name="ref" value={ref} />}
          <div className={styles.field}>
            <label htmlFor="firstName">Förnamn</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="email">E-post</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Lösenord</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: "0.82rem",
              color: "var(--text-soft)",
              margin: "4px 0 18px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              name="newsletter"
              defaultChecked
              style={{ marginTop: 2, width: "auto" }}
            />
            Skicka mig då och då träningstips, påminnelser och information om
            era tjänster
          </label>

          <button className={`btn btn-primary ${styles.submit}`} type="submit">
            Skapa konto
          </button>
        </form>

        <div className={styles.switch}>
          Har du redan ett konto? <Link href="/login">Logga in</Link>
        </div>
      </div>
    </div>
  );
}
