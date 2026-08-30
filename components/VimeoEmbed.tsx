"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Player from "@vimeo/player";

// Vimeos spelare döljer knappar (bl.a. fullskärm) bakom en pil när iframen
// är smal — vanligt på mobil där videobredden ofta är under ~450px. Genom
// att rendera iframen i en fast "virtuell" bredd och sedan skala ner den
// visuellt med CSS transform tror Vimeo alltid att den har gott om plats,
// så alla kontroller (inklusive fullskärm) syns direkt utan extra tryck.
// Transformen påverkar bara hur iframe-elementet visas på sidan — den når
// inte in i iframens egna dokument, så Vimeos fullskärmsläge fungerar som
// vanligt.
const VIRTUAL_WIDTH = 640;

export default function VimeoEmbed({
  src,
  className,
  lazy = false,
  poster = null,
  aspectRatio,
}: {
  src: string;
  className?: string;
  lazy?: boolean;
  poster?: string | null;
  // Videons egen bredd/höjd-kvot (från oEmbed via VimeoPoster). Utan den
  // antar vi 16:9 — men en smal/stående video tvingad in i en 16:9-ruta
  // gör att Vimeos spelare fyller ut sidorna med en suddig utdragen kopia
  // av bilden. Med rätt kvot formar sig rutan efter videon istället.
  aspectRatio?: number;
}) {
  const ratio = aspectRatio ?? 16 / 9;
  const VIRTUAL_HEIGHT = VIRTUAL_WIDTH / ratio;
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [scale, setScale] = useState<number | null>(null);
  const [visible, setVisible] = useState(!lazy);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setScale(el.offsetWidth / VIRTUAL_WIDTH);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!lazy) return;
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lazy]);

  // Callback ref istället för useEffect + iframeRef: iframen monteras
  // först när både `visible` OCH `scale` är satta (skala beräknas
  // asynkront av ett ResizeObserver-anrop efter första render), så en
  // effect med [visible] i sitt beroende-array kan hinna köra medan
  // iframen fortfarande är null och sen aldrig köras igen — spelaren
  // hann då aldrig registrera sin "play"-lyssnare. En callback ref körs
  // exakt när elementet faktiskt finns i DOM:en, så det problemet
  // försvinner helt.
  const setIframeNode = useCallback((node: HTMLIFrameElement | null) => {
    iframeRef.current = node;
    if (node) {
      const player = new Player(node);
      playerRef.current = player;
      player.on("play", () => setStarted(true));
    } else {
      playerRef.current?.off("play");
      playerRef.current = null;
    }
  }, []);

  function handleFullscreenClick() {
    playerRef.current?.requestFullscreen().catch(() => {});
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: "relative", ...(aspectRatio ? { aspectRatio } : {}) }}
    >
      {poster && !started && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
      {scale !== null && visible && (
        <iframe
          ref={setIframeNode}
          src={src}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: VIRTUAL_WIDTH,
            height: VIRTUAL_HEIGHT,
            border: "none",
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      )}
      {scale !== null && visible && !started && (
        // pointer-events: none — tappet ska nå fram till Vimeo-iframen under
        // och triggra dess inbyggda klicka-för-att-spela. Om vi istället
        // fångar klicket här och anropar player.play() via SDK:n går
        // kommandot via en asynkron postMessage-resa till iframen, vilket
        // gör att mobila webbläsare (särskilt iOS Safari) inte längre
        // räknar det som en direkt användarinteraktion och blockerar
        // uppspelningen tyst.
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.15)",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginLeft: 3 }}>
              <path d="M8 5v14l11-7z" fill="#2b2e2a" />
            </svg>
          </span>
        </div>
      )}
      {scale !== null && visible && started && (
        <button
          type="button"
          onClick={handleFullscreenClick}
          aria-label="Fullskärm"
          style={{
            position: "absolute",
            right: 10,
            bottom: 10,
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "rgba(0, 0, 0, 0.55)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
