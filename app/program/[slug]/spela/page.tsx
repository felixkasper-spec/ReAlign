import { redirect, notFound } from "next/navigation";
import { getPlayerData } from "@/lib/player-data";
import { logProgramCompletion } from "@/app/min-sida/schedule-actions";
import ProgramPlayer from "@/components/ProgramPlayer";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return pageMetadata({
    title: "Kör pass — ReAlign Metoden",
    description: "Kör igenom programmet, en övning i taget.",
    path: `/program/${slug}/spela`,
  });
}

export default async function ProgramPlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string; start?: string }>;
}) {
  const { slug } = await params;
  const { variant, start } = await searchParams;

  const data = await getPlayerData(slug, variant ?? "full", start);
  if (!data) notFound();

  if (data.locked) {
    redirect(`/program/${slug}`);
  }

  if (data.exercises.length === 0) {
    redirect(`/program/${slug}`);
  }

  return (
    <ProgramPlayer
      exercises={data.exercises}
      programTitle={data.program.title}
      backHref={`/program/${slug}`}
      loggedIn={!!data.user}
      completeAction={logProgramCompletion.bind(null, data.program.id, data.program.title)}
      initialIndex={data.initialIndex}
    />
  );
}
