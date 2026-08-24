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
  const { data: program } = await supabase
    .from("programs")
    .select("title, category")
    .eq("slug", slug)
    .maybeSingle();

  return buildOgImage(program?.title ?? "Träningsprogram", program?.category ?? "Program");
}
