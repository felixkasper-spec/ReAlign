import { requireClinicStaff } from "@/lib/coach";
import { buildSocialImage, type SocialImageFormat } from "@/lib/social-image";

export async function GET(req: Request) {
  await requireClinicStaff();

  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "ReAlign Metoden";
  const eyebrow = searchParams.get("eyebrow") ?? undefined;
  const caption = searchParams.get("caption") ?? undefined;
  const format = (searchParams.get("format") as SocialImageFormat) ?? "portrait";

  return buildSocialImage({ title, eyebrow, caption, format });
}
