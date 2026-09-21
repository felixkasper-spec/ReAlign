"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ServicesModal, { type ServiceRow } from "./ServicesModal";
import styles from "./admin-shell.module.css";

const LINKS = [
  { href: "/coaching", label: "Admin" },
  { href: "/coaching/kalender", label: "Kalender" },
  { href: "/coaching/kunder", label: "Kunder" },
  { href: "/coaching/leads", label: "Leads" },
  { href: "/coaching/upplagg", label: "Upplägg" },
  { href: "/coaching/intag", label: "Intag" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/coaching") return pathname === "/coaching";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar({ services }: { services: ServiceRow[] }) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const programActive = isActive(pathname, "/coaching/kundprogram");

  return (
    <>
      <button
        type="button"
        className={styles.mobileMenuBtn}
        aria-label="Meny"
        onClick={() => setMobileOpen((open) => !open)}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />
      )}

      <nav
        className={styles.sidebar}
        data-open={mobileOpen || undefined}
        // Stänger dropdown-menyn på mobil så fort man navigerar via en länk
        // (Tjänster-knappen och dropdown-rubrikerna är inte <a>-element, så
        // de påverkas inte av detta).
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === "A" || target.closest("a")) setMobileOpen(false);
        }}
      >
        <Link href="/" className={styles.sidebarLogo}>
          <Image src="/logo.png" alt="ReAlign Metoden" width={48} height={30} priority />
        </Link>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.sidebarLink}
            data-active={isActive(pathname, link.href) || undefined}
          >
            {link.label}
          </Link>
        ))}
        <button type="button" className={styles.sidebarLink} onClick={() => setServicesOpen(true)}>
          Tjänster
        </button>

        <details className={styles.sidebarDropdown} open={programActive}>
          <summary className={styles.sidebarLink} data-active={programActive || undefined}>
            Kundprogram
          </summary>
          <div className={styles.sidebarSubList}>
            <Link
              href="/coaching/kundprogram"
              className={styles.sidebarSubLink}
              data-active={pathname === "/coaching/kundprogram" || undefined}
            >
              Alla kundprogram
            </Link>
            <Link
              href="/coaching/kundprogram/ny"
              className={styles.sidebarSubLink}
              data-active={isActive(pathname, "/coaching/kundprogram/ny") || undefined}
            >
              Skapa nytt program
            </Link>
          </div>
        </details>
      </nav>

      {servicesOpen && (
        <ServicesModal services={services} onClose={() => setServicesOpen(false)} />
      )}
    </>
  );
}
