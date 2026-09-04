"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteSearch from "./SiteSearch";
import styles from "./Header.module.css";

const navLinks = [
  { href: "/program", label: "Program" },
  { href: "/ovningsbank", label: "Övningsbank" },
  { href: "/ergonomi", label: "Ergonomi" },
  { href: "/om-metoden", label: "Om metoden" },
  { href: "/analys", label: "Vägledning" },
];

export default function HeaderClient({
  loggedIn,
  transparent,
}: {
  loggedIn: boolean;
  transparent?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <nav className={`${styles.nav} ${transparent ? styles.transparent : ""}`}>
      <Link
        className={styles.logo}
        href="/"
        onClick={() => {
          if (window.location.pathname === "/") {
            window.scrollTo({ top: 0, behavior: "instant" });
            history.replaceState(null, "", "/");
          }
        }}
      >
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
        <button
          type="button"
          className={styles.navSearchBtn}
          onClick={() => {
            setOpen(false);
            setSearchOpen(true);
          }}
        >
          ⌕ Sök
        </button>
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
            <Link
              className={styles.mobileLoginIcon}
              href="/login"
              aria-label="Logga in"
              title="Logga in"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </Link>
            <Link className="btn btn-primary" href="/signup">
              Skapa <span className={styles.ctaGratis}>gratis </span>konto
            </Link>
          </>
        )}
      </div>
      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
}
