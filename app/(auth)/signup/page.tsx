import Link from "next/link";
import styles from "../auth.module.css";
import { signup } from "./actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const { error, success } = await searchParams;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <span className="eyebrow">Kom igång</span>
        <h1>Skapa gratis konto</h1>
        <p>Spara favoriter och schemalägg din träning — helt gratis.</p>

        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div className={styles.success}>
            Nästan klart! Kolla din inkorg och klicka på bekräftelselänken vi
            skickat till dig.
          </div>
        )}

        <form action={signup}>
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
