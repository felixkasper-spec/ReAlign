import Link from "next/link";
import styles from "../auth.module.css";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <span className="eyebrow">Min sida</span>
        <h1>Logga in</h1>
        <p>Kom åt dina favoriter, ditt schema och din träningslogg.</p>

        {error && <div className={styles.error}>{error}</div>}

        <form action={login}>
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
              autoComplete="current-password"
              required
            />
          </div>
          <button className={`btn btn-primary ${styles.submit}`} type="submit">
            Logga in
          </button>
        </form>

        <div className={styles.switch}>
          Inget konto än? <Link href="/signup">Skapa ett gratis</Link>
        </div>
      </div>
    </div>
  );
}
