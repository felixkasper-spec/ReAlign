"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import styles from "./AttachmentMedia.module.css";

export default function AttachmentMedia({ url, type }: { url: string; type: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={styles.wrap}>
        {type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element -- signerad, tillfällig Storage-URL
          <img
            src={url}
            alt="Bifogad bild"
            className={styles.thumb}
            onClick={() => setOpen(true)}
          />
        ) : (
          <video src={url} controls className={styles.thumb} />
        )}
        <button
          type="button"
          className={styles.expandBtn}
          onClick={() => setOpen(true)}
          aria-label="Visa större"
          title="Visa större"
        >
          ⤢
        </button>
      </div>

      {open &&
        createPortal(
          <div className={styles.overlay} onClick={() => setOpen(false)}>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label="Stäng"
            >
              ✕
            </button>
            <div className={styles.content} onClick={(e) => e.stopPropagation()}>
              {type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element -- signerad, tillfällig Storage-URL
                <img src={url} alt="Bifogad bild" className={styles.fullImg} />
              ) : (
                <video src={url} controls autoPlay className={styles.fullVideo} />
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
