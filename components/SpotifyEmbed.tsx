"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./SpotifyEmbed.module.css";

export default function SpotifyEmbed({
  episodeId,
  preview,
}: {
  episodeId: string;
  preview?: { title: string; thumbnailUrl: string } | null;
}) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        className={styles.frame}
        src={`https://open.spotify.com/embed/episode/${episodeId}`}
        width="100%"
        height="152"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
    );
  }

  if (preview) {
    return (
      <button
        type="button"
        className={styles.previewCard}
        onClick={() => setLoaded(true)}
      >
        <div className={styles.previewArt}>
          <Image
            src={preview.thumbnailUrl}
            alt=""
            fill
            sizes="120px"
          />
        </div>
        <div className={styles.previewBody}>
          <span className={styles.previewLabel}>Spotify</span>
          <span className={styles.previewTitle}>{preview.title}</span>
        </div>
        <span className={styles.play}>▶</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={styles.cover}
      onClick={() => setLoaded(true)}
    >
      <span className={styles.play}>▶</span>
      <span>Lyssna på avsnittet</span>
    </button>
  );
}
