import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GuestAccountPrompt from "@/components/GuestAccountPrompt";
import { hasThumbnail } from "@/app/ovningsbank/thumbnails";
import { getClinicProgramPlayerData, recordClinicProgramVisit } from "@/lib/clinic-program";
import { pageMetadata } from "@/lib/page-metadata";
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
          <span className="eyebrow">Satt ihop åt dig av Cleer Klinik</span>
          <h1>Ditt program</h1>
          <p style={{ color: "var(--text-soft)", marginTop: 8 }}>
            Ett program satt ihop åt dig — klicka på en övning för video- och
            textinstruktioner, eller kör hela passet i följd.
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
            <Link key={ex.slug} href={`/p/${token}/spela?start=${ex.slug}`} className={styles.exRow}>
              <span className={styles.exNum}>{i + 1}</span>
              {hasThumbnail(ex.slug) && (
                <span className={styles.exThumb}>
                  <Image src={`/exercises/${ex.slug}.jpg`} alt="" fill sizes="52px" />
                  <span className={styles.playIcon} aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="white">
                      <path d="M3 1.5v11l9-5.5-9-5.5z" />
                    </svg>
                  </span>
                </span>
              )}
              <span className={styles.exInfo}>
                <h3>{ex.title}</h3>
                {ex.setsReps && (
                  <span style={{ fontSize: "0.82rem", color: "var(--text-soft)" }}>
                    {ex.setsReps}
                  </span>
                )}
              </span>
              <span className={styles.exArrow}>→</span>
            </Link>
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
