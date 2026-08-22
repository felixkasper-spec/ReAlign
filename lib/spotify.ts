import "server-only";

export type SpotifyOembed = {
  title: string;
  thumbnailUrl: string;
};

/**
 * Hämtar avsnittets titel + omslagsbild via Spotifys egna oEmbed-API, så vi
 * kan visa en riktig förhandsvisning utan att ladda den tunga spelar-iframen
 * förrän användaren faktiskt vill lyssna. Cachas ett dygn — avsnittsmetadata
 * ändras i praktiken aldrig.
 */
export async function getSpotifyOembed(
  episodeId: string,
): Promise<SpotifyOembed | null> {
  try {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=https://open.spotify.com/episode/${episodeId}`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.title || !data.thumbnail_url) return null;
    return { title: data.title, thumbnailUrl: data.thumbnail_url };
  } catch {
    return null;
  }
}
