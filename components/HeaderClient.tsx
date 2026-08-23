"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Header.module.css";

const navLinks = [
  { href: "/program", label: "Program" },
  { href: "/ovningsbank", label: "Övningsbank" },
  { href: "/ergonomi", label: "Ergonomi" },
  { href: "/om-metoden", label: "Om metoden" },
  { href: "/analys", label: "Vägledning" },
];

export default function HeaderClient({ loggedIn }: { loggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className={styles.nav}>
      <Link className={styles.logo} href="/">
        <span className={styles.mark} />
        ReAlign
      </Link>
      <button
        className={styles.menuToggle}
        aria-label="Öppna meny"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.menuIcon}>☰</span>
        <span className={styles.menuLabel}>Meny</span>
      </button>
      <div className={`${styles.navlinks} ${open ? styles.open : ""}`}>
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
        {!loggedIn && (
          <Link href="/login" className={styles.mobileLogin}>
            Logga in
          </Link>
        )}
        {loggedIn && (
          <form action="/auth/signout" method="post" className={styles.mobileLogin}>
            <button type="submit" className={styles.mobileLogout}>
              Logga ut
            </button>
          </form>
        )}
      </div>
      <div className={styles.navcta}>
        {loggedIn ? (
          <>
            <form action="/auth/signout" method="post" className={styles.desktopOnly}>
              <button type="submit" className="btn btn-ghost">
                Logga ut
              </button>
            </form>
            <Link className="btn btn-primary" href="/min-sida">
              Min sida
            </Link>
          </>
        ) : (
          <>
            <Link className={`btn btn-ghost ${styles.desktopOnly}`} href="/login">
              Logga in
            </Link>
            <Link className="btn btn-primary" href="/signup">
              Kom igång
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
