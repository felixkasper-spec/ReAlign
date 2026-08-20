"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleFavorite } from "@/app/ovningsbank/actions";
import styles from "./FavoriteButton.module.css";

export default function FavoriteButton({
  exerciseId,
  initialFavorited,
  loggedIn,
}: {
  exerciseId: string;
  initialFavorited: boolean;
  loggedIn: boolean;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!loggedIn) {
      router.push("/login");
      return;
    }

    const next = !favorited;
    setFavorited(next);
    startTransition(async () => {
      try {
        await toggleFavorite(exerciseId);
      } catch {
        setFavorited(!next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`${styles.favBtn} ${favorited ? styles.active : ""}`}
      aria-pressed={favorited}
    >
      <span className={styles.heart}>{favorited ? "♥" : "♡"}</span>
      {favorited ? "Sparad" : "Spara som favorit"}
    </button>
  );
}
