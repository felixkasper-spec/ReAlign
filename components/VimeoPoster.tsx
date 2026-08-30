import { getVimeoThumbnail } from "@/lib/vimeo-thumbnail";
import VimeoEmbed from "./VimeoEmbed";

// Server-komponent som gör själva thumbnail-hämtningen — tänkt att
// användas inuti en <Suspense>, så att en långsam/kall Vimeo-oEmbed-
// träff bara fördröjer just videorutan (som strömmas in när den är
// klar) istället för att blockera hela sidans första render.
export default async function VimeoPoster({
  src,
  className,
  lazy,
}: {
  src: string;
  className?: string;
  lazy?: boolean;
}) {
  const thumbnail = await getVimeoThumbnail(src);
  return (
    <VimeoEmbed
      src={src}
      className={className}
      lazy={lazy}
      poster={thumbnail?.url ?? null}
      aspectRatio={thumbnail?.aspectRatio}
    />
  );
}
