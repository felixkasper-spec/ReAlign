import { notFound } from "next/navigation";
import { getClinicProgramPlayerData } from "@/lib/clinic-program";
import ProgramPlayer from "@/components/ProgramPlayer";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return pageMetadata({
    title: "Kör pass — ReAlign Metoden",
    description: "Kör igenom ditt personliga program, en övning i taget.",
    path: `/p/${token}/spela`,
  });
}

export default async function ClinicProgramPlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ start?: string }>;
}) {
  const { token } = await params;
  const { start } = await searchParams;

  const data = await getClinicProgramPlayerData(token, start);
  if (!data || data.exercises.length === 0) notFound();

  return (
    <ProgramPlayer
      exercises={data.exercises}
      programTitle="ditt program"
      backHref={`/p/${token}`}
      loggedIn={false}
      initialIndex={data.initialIndex}
    />
  );
}
