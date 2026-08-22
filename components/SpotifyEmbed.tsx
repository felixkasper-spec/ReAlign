"use client";

import { useState } from "react";
import styles from "./SpotifyEmbed.module.css";

export default function SpotifyEmbed({ episodeId }: { episodeId: string }) {
  const [loaded, setLoaded] = useState(false);

  if (!loaded) {
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
