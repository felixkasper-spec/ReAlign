// Vimeos spelare målar inget eget poster-läge förrän player.js har startat
// inuti iframen, vilket är den där 2-3 sekunders "tomma ruta"-känslan på
// varje videoyta i sajten. Genom att hämta en riktig thumbnail-bild via
// Vimeos officiella oEmbed-endpoint och rendera den som en vanlig <img>
// innan iframen ens monteras slipper besökaren se en tom yta — bilden
// finns där redan vid första paint. Next cachar fetch-anropet i 30 dagar
// per video-id server-side, så kostnaden betalas bara en gång per video.
export async function getVimeoThumbnail(embedSrc: string): Promise<string | null> {
  // Övningsvideorna är hash-skyddade ("unlisted") — oEmbed svarar 404 på
  // en bar vimeo.com/<id>-URL utan ?h=-hashen, så hela embed-URL:en
  // (player.vimeo.com/video/<id>?h=<hash>) måste skickas med rakt av.
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(embedSrc)}&width=640`,
      { next: { revalidate: 60 * 60 * 24 * 30 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.thumbnail_url === "string" ? data.thumbnail_url : null;
  } catch {
    return null;
  }
}
