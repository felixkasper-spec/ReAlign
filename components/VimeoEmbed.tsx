"use client";

import { useEffect, useRef, useState } from "react";

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
  const [scale, setScale] = useState<number | null>(null);
  const [visible, setVisible] = useState(!lazy);

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

  return (
    <div ref={containerRef} className={className}>
      {scale !== null && visible && (
        <iframe
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
    </div>
  );
}
