"use client";

import { useEffect, useRef, useState } from "react";
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
const VIRTUAL_HEIGHT = (VIRTUAL_WIDTH * 9) / 16;

export default function VimeoEmbed({
  src,
  className,
  lazy = false,
}: {
  src: string;
  className?: string;
  lazy?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
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

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!visible || !iframe) return;

    const player = new Player(iframe);
    player.on("play", () => setStarted(true));

    return () => {
      player.off("play");
    };
  }, [visible]);

  function handlePlayClick() {
    const iframe = iframeRef.current;
    if (!iframe) return;
    new Player(iframe).play().catch(() => {});
  }

  function handleFullscreenClick() {
    const iframe = iframeRef.current;
    if (!iframe) return;
    new Player(iframe).requestFullscreen().catch(() => {});
  }

  return (
    <div ref={containerRef} className={className} style={{ position: "relative" }}>
      {scale !== null && visible && (
        <iframe
          ref={iframeRef}
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
        <button
          type="button"
          onClick={handlePlayClick}
          aria-label="Spela video"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.15)",
            border: "none",
            cursor: "pointer",
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
        </button>
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
