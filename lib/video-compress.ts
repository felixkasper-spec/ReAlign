// Snabb, tillfällig utväg runt Supabase Storage-projektets 50MB-gräns
// (kräver Pro-plan för att höja) — tanken är att byta till Vimeo-baserad
// uppladdning senare, men fram tills dess körs videon igenom en
// browser-inbyggd komprimering (canvas + MediaRecorder, ingen extra
// dependency) innan den laddas upp. Best effort: om något i kedjan inte
// stöds eller misslyckas, eller om resultatet inte faktiskt blev mindre,
// returneras originalfilen oförändrad — samma beteende som innan denna
// funktion fanns.

const MAX_DIMENSION = 960; // px på längsta sidan — gott för ett övningsklipp
const TARGET_VIDEO_BITRATE = 1_500_000; // ~1.5 Mbps
const SKIP_BELOW_BYTES = 45 * 1024 * 1024; // redan under gränsen, inget att vinna

export async function compressVideoIfPossible(file: File): Promise<File> {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return file;
  }
  if (file.size <= SKIP_BELOW_BYTES) {
    return file;
  }

  try {
    const timeoutMs = 3 * 60 * 1000; // tak så en trasig video aldrig hänger UI:t
    const result = await Promise.race([
      runCompression(file),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Komprimering tog för lång tid")), timeoutMs),
      ),
    ]);
    return result.size < file.size ? result : file;
  } catch (err) {
    console.error("compressVideoIfPossible — kör vidare med originalfilen:", err);
    return file;
  }
}

async function runCompression(file: File): Promise<File> {
  const video = document.createElement("video");
  video.playsInline = true;
  // Muted krävs för att play() ska garanterat tillåtas utan färskt
  // user-gesture (vi kan vara några await:s bort från klicket vid det här
  // laget) — ljudspåret fångas ändå separat nedan via video-elementets
  // egen captureStream(), inte via det (tysta) canvas-renderingsflödet.
  video.muted = true;
  video.src = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("Kunde inte läsa videon"));
  });

  const { videoWidth, videoHeight, duration } = video;
  if (!videoWidth || !videoHeight || !Number.isFinite(duration) || duration <= 0) {
    throw new Error("Ogiltig video");
  }

  const scale = Math.min(1, MAX_DIMENSION / Math.max(videoWidth, videoHeight));
  const targetWidth = Math.max(2, Math.round((videoWidth * scale) / 2) * 2);
  const targetHeight = Math.max(2, Math.round((videoHeight * scale) / 2) * 2);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas stöds inte i den här webbläsaren");

  const canvasStream = (canvas as HTMLCanvasElement & { captureStream: (fps?: number) => MediaStream }).captureStream(30);

  // captureStream() på <canvas> ger bara bildspåret — ljudet måste fångas
  // separat från originalvideon och läggas till i samma ström.
  type MediaCaptureElement = HTMLVideoElement & {
    captureStream?: () => MediaStream;
    mozCaptureStream?: () => MediaStream;
  };
  const el = video as MediaCaptureElement;
  const sourceStream = el.captureStream?.() ?? el.mozCaptureStream?.();
  const audioTrack = sourceStream?.getAudioTracks()[0];
  if (audioTrack) canvasStream.addTrack(audioTrack);

  const mimeType = pickSupportedMimeType();
  const recorder = new MediaRecorder(canvasStream, {
    mimeType,
    videoBitsPerSecond: TARGET_VIDEO_BITRATE,
  });

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const stopped = new Promise<void>((resolve) => {
    recorder.onstop = () => resolve();
  });

  let rafId = 0;
  function drawFrame() {
    ctx!.drawImage(video, 0, 0, targetWidth, targetHeight);
    rafId = requestAnimationFrame(drawFrame);
  }

  recorder.start();
  video.currentTime = 0;
  await video.play();
  drawFrame();

  await new Promise<void>((resolve) => {
    video.onended = () => resolve();
  });

  cancelAnimationFrame(rafId);
  recorder.stop();
  await stopped;

  URL.revokeObjectURL(video.src);
  sourceStream?.getTracks().forEach((t) => t.stop());
  canvasStream.getTracks().forEach((t) => t.stop());

  const blob = new Blob(chunks, { type: mimeType });
  const ext = mimeType.includes("mp4") ? "mp4" : "webm";
  const name = file.name.replace(/\.[^.]+$/, "") + `-komprimerad.${ext}`;
  return new File([blob], name, { type: mimeType });
}

function pickSupportedMimeType(): string {
  const candidates = [
    "video/mp4;codecs=h264,aac",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "video/webm";
}
