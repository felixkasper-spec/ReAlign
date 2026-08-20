"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Header.module.css";

const navLinks = [
  { href: "/program", label: "Program" },
  { href: "/ovningsbank", label: "Övningsbank" },
  { href: "/ergonomi", label: "Ergonomi" },
  { href: "/om-metoden", label: "Om metoden" },
  { href: "/analys", label: "Analysera dig" },
];

export default function Header() {
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
        ☰
      </button>
      <div className={`${styles.navlinks} ${open ? styles.open : ""}`}>
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
      <div className={styles.navcta}>
        <Link className="btn btn-ghost" href="/login">
          Logga in
        </Link>
        <Link className="btn btn-primary" href="/signup">
          Kom igång
        </Link>
      </div>
    </nav>
  );
}
