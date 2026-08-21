"use client";

import { useState } from "react";
import styles from "./FaqAccordion.module.css";

export type FaqGroup = {
  eyebrow: string;
  items: { q: string; a: string }[];
};

export default function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  const [openKey, setOpenKey] = useState<string | null>("0-0");

  return (
    <>
      {groups.map((group, gi) => (
        <div className={styles.faqGroup} key={group.eyebrow}>
          <span className="eyebrow">{group.eyebrow}</span>
          {group.items.map((item, ii) => {
            const key = `${gi}-${ii}`;
            const open = openKey === key;
            return (
              <div className={`${styles.faqItem} ${open ? styles.open : ""}`} key={key}>
                <button
                  type="button"
                  className={styles.faqQ}
                  onClick={() => setOpenKey(open ? null : key)}
                >
                  <span>{item.q}</span>
                  <span className={styles.chev}>▾</span>
                </button>
                {open && (
                  <div className={styles.faqA}>
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}
