import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GuestAccountPrompt from "@/components/GuestAccountPrompt";
import { getClinicProgramPlayerData, recordClinicProgramVisit } from "@/lib/clinic-program";
import { pageMetadata } from "@/lib/page-metadata";
import ClinicExerciseRow from "./ClinicExerciseRow";
import styles from "../../program/[slug]/page.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return pageMetadata({
    title: "Ditt program — ReAlign Metoden",
    description: "Ett skräddarsytt övningsprogram från din behandlare.",
    path: `/p/${token}`,
  });
}

export default async function ClinicProgramPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getClinicProgramPlayerData(token);

  if (!data || data.exercises.length === 0) {
    notFound();
  }

  await recordClinicProgramVisit(data.id);

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.progHead}>
          <span className="eyebrow">Program från Cleer Klinik</span>
          <h1>Ditt program</h1>
          <p style={{ color: "var(--text-soft)", marginTop: 8 }}>
            Klicka på en övning för video- och textinstruktioner, eller kör
            hela passet i följd genom att trycka på &quot;Starta program&quot;.
          </p>
          <div style={{ marginTop: 14 }}>
            <Link href={`/p/${token}/spela`} className={styles.startProgramBtn}>
              Starta program →
            </Link>
          </div>
        </div>

        <p className={styles.exHint}>🎥 Klicka på en övning för video- och textinstruktioner</p>
        <div className={styles.exListHead}>
          <h2>Övningar i programmet</h2>
          <span>{data.exercises.length} st, i ordning</span>
        </div>
        <div>
          {data.exercises.map((ex, i) => (
            <ClinicExerciseRow
              key={ex.slug}
              exercise={ex}
              index={i}
              playerHref={`/p/${token}/spela?start=${ex.slug}`}
            />
          ))}
        </div>

        <div style={{ marginTop: 30 }}>
          <GuestAccountPrompt href={`/signup?source=klinik&ref=${token}`} />
        </div>

        <Footer />
      </div>
    </>
  );
}
