import { createClient } from "@/lib/supabase/server";
import { buildOgImage, ogImageSize, ogImageContentType } from "@/lib/og-image";

export const size = ogImageSize;
export const contentType = ogImageContentType;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: exercise } = await supabase
    .from("exercises")
    .select("title, body_part")
    .eq("slug", slug)
    .maybeSingle();

  return buildOgImage(exercise?.title ?? "Övning", exercise?.body_part ?? "Övningsbank");
}
