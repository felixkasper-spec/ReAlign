"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SiteSearch from "./SiteSearch";
import { pushToDataLayer } from "@/lib/gtm";
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
  userId,
  transparent,
}: {
  loggedIn: boolean;
  userId: string | null;
  transparent?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

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

  useEffect(() => {
    if (userId) {
      pushToDataLayer({ event: "login", user_id: userId });
    }
  }, [userId, pathname]);

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
            <Link className="btn btn-primary" href="/signup">
              Skapa gratis konto
            </Link>
          </>
        )}
      </div>
      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
}
