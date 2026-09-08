"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Player from "@vimeo/player";
import styles from "./VimeoEmbed.module.css";

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
  autoplay = false,
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
  // Startar videon automatiskt, tystad — webbläsare (särskilt iOS Safari,
  // vilket Facebook/Instagrams inbyggda webbläsare bygger på) tillåter
  // pålitligt bara MUTED autoplay, aldrig autoplay med ljud, oavsett
  // föregående klick. Visar en förstorad ljudknapp (samma stil som
  // fullskärmsknappen) så besökaren kan slå på ljudet med ett tryck.
  autoplay?: boolean;
}) {
  const ratio = aspectRatio ?? 16 / 9;
  const VIRTUAL_HEIGHT = VIRTUAL_WIDTH / ratio;
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const [scale, setScale] = useState<number | null>(null);
  const [visible, setVisible] = useState(!lazy);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(autoplay);
  // Pulserar ljudknappen en kort stund efter att videon börjat spelas
  // (tystad, se autoplay-kommentaren nedan) så besökaren märker att den
  // går att slå på — utan att vara en permanent, påträngande markering.
  const [muteHintActive, setMuteHintActive] = useState(false);
  const hintShownRef = useRef(false);
  // controls=0 döljer Vimeos egna kontrollrad (play/paus, spolningslist,
  // volym, inställningskugghjul) — bara meningsfullt när vi har egna
  // ersättningsknappar (play/paus, ljud, fullskärm) att visa istället,
  // dvs. bara i autoplay-läget. Övriga videor på sajten saknar egen
  // play/paus-knapp och behöver därför Vimeos inbyggda kontroller kvar.
  // loop=1 spelar om videon automatiskt om den hinner ta slut innan
  // besökaren själv gått vidare till nästa övning.
  const embedSrc = autoplay ? `${src}&autoplay=1&muted=1&controls=0&loop=1` : src;

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
      player.on("play", () => {
        setStarted(true);
        setPlaying(true);
        if (autoplay && !hintShownRef.current) {
          hintShownRef.current = true;
          setMuteHintActive(true);
        }
      });
      player.on("pause", () => setPlaying(false));
    } else {
      playerRef.current?.off("play");
      playerRef.current?.off("pause");
      playerRef.current = null;
    }
  }, [autoplay]);

  useEffect(() => {
    if (!muteHintActive) return;
    const t = setTimeout(() => setMuteHintActive(false), 3300);
    return () => clearTimeout(t);
  }, [muteHintActive]);

  function handleFullscreenClick() {
    playerRef.current?.requestFullscreen().catch(() => {});
  }

  function handleMuteClick() {
    const next = !muted;
    playerRef.current?.setMuted(next).catch(() => {});
    setMuted(next);
    if (!next) {
      setMuteHintActive(false);
    }
  }

  // Säkert att styra via SDK:n här (till skillnad från den allra första
  // uppspelningen, se kommentaren vid klicka-för-att-spela-lagret nedan) —
  // videon är redan igång och tystad, så play/paus omfattas inte av
  // webbläsares restriktiva regler för uppspelning-med-ljud.
  function handlePlayPauseClick() {
    if (playing) {
      playerRef.current?.pause().catch(() => {});
    } else {
      playerRef.current?.play().catch(() => {});
    }
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
          src={embedSrc}
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
      {scale !== null && visible && !started && !autoplay && (
        // pointer-events: none — tappet ska nå fram till Vimeo-iframen under
        // och triggra dess inbyggda klicka-för-att-spela. Om vi istället
        // fångar klicket här och anropar player.play() via SDK:n går
        // kommandot via en asynkron postMessage-resa till iframen, vilket
        // gör att mobila webbläsare (särskilt iOS Safari) inte längre
        // räknar det som en direkt användarinteraktion och blockerar
        // uppspelningen tyst. Vid autoplay behövs detta lager inte —
        // videon startar av sig själv, och en egen förstorad
        // play/paus-knapp (nedan) styr resten via SDK:n.
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
            width: 52,
            height: 52,
            borderRadius: 12,
            background: "rgba(0, 0, 0, 0.55)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
      {scale !== null && visible && started && autoplay && (
        <button
          type="button"
          onClick={handleMuteClick}
          aria-label={muted ? "Slå på ljud" : "Stäng av ljud"}
          className={muteHintActive ? styles.mutePulse : undefined}
          style={{
            position: "absolute",
            left: 10,
            bottom: 10,
            width: 52,
            height: 52,
            borderRadius: 12,
            background: "rgba(0, 0, 0, 0.55)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M4 9v6h4l5 5V4L8 9H4z" fill="#fff" />
            {muted ? (
              <path
                d="M16 9l6 6M22 9l-6 6"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M16 8a5 5 0 010 8M19 5a9 9 0 010 14"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      )}
      {scale !== null && visible && started && autoplay && (
        <button
          type="button"
          onClick={handlePlayPauseClick}
          aria-label={playing ? "Pausa" : "Spela upp"}
          style={{
            position: "absolute",
            left: "50%",
            bottom: 10,
            transform: "translateX(-50%)",
            width: 52,
            height: 52,
            borderRadius: 12,
            background: "rgba(0, 0, 0, 0.55)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {playing ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
              <rect x="5" y="4" width="5" height="16" rx="1.5" />
              <rect x="14" y="4" width="5" height="16" rx="1.5" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" style={{ marginLeft: 3 }}>
              <path d="M6 4v16l14-8z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
