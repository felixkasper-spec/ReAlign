import { redirect, notFound } from "next/navigation";
import { getPlayerData } from "@/lib/player-data";
import { logProgramCompletion } from "@/app/min-sida/schedule-actions";
import ProgramPlayer from "@/components/ProgramPlayer";
import { pageMetadata } from "@/lib/page-metadata";

const PROGRAM_SLUG = "helkropp-niva-2";

export const metadata = pageMetadata({
  title: "Kör pass — ReAlign Metoden",
  description: "Kör igenom 5-minutersprogrammet, en övning i taget.",
  path: "/5-minuter/spela",
});

export default async function FiveMinutesPlayerPage() {
  const data = await getPlayerData(PROGRAM_SLUG, "kort");
  if (!data) notFound();

  if (data.locked || data.exercises.length === 0) {
    redirect("/5-minuter");
  }

  return (
    <ProgramPlayer
      exercises={data.exercises}
      programTitle="5-minutersprogrammet"
      backHref="/5-minuter"
      loggedIn={!!data.user}
      completeAction={logProgramCompletion.bind(null, data.program.id, data.program.title)}
    />
  );
}
