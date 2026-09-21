import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireClinicStaff } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateClinicProgram } from "../../actions";
import ClinicProgramBuilder, { type SelectedRow } from "../../ClinicProgramBuilder";
import styles from "../../../page.module.css";

export const metadata: Metadata = { title: "Redigera kundprogram — ReAlign Metoden" };

export default async function EditClinicProgramPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; detail?: string }>;
}) {
  await requireClinicStaff();
  const { id } = await params;
  const { error, detail } = await searchParams;
  const admin = createAdminClient();

  const [{ data: program }, { data: exercises }, { data: rows }] = await Promise.all([
    admin.from("clinic_programs").select("id, label").eq("id", id).maybeSingle(),
    admin.from("exercises").select("id, slug, title, body_part").order("body_part").order("title"),
    admin
      .from("clinic_program_exercises")
      .select("id, notes, order_index, custom_title, custom_video_url, exercises ( id, title )")
      .eq("clinic_program_id", id)
      .order("order_index"),
  ]);

  if (!program) notFound();

  const initialSelected: SelectedRow[] = (rows ?? []).map((r) => {
    const ex = r.exercises as unknown as { id: string; title: string } | null;
    if (ex) {
      return { rowId: r.id, id: ex.id, title: ex.title, notes: r.notes ?? "" };
    }
    return {
      rowId: r.id,
      id: `custom-${r.id}`,
      title: r.custom_title ?? "Egen övning",
      notes: r.notes ?? "",
      isCustom: true,
      customVideoUrl: r.custom_video_url ?? "",
    };
  });

  return (
      <div className={`wrap ${styles.wrap}`}>
        <Link href={`/coaching/kundprogram/${id}`} className={styles.back}>
          ← Kundprogram
        </Link>
        <span className="eyebrow">Coach-verktyg</span>
        <h1>Redigera kundprogram</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 24 }}>
          Länken kunden redan har fortsätter fungera — sparar du ändras bara innehållet den visar.
        </p>

        {error === "1" && (
          <p
            style={{
              background: "var(--warm-soft)",
              color: "#5a4530",
              borderRadius: 12,
              padding: "12px 16px",
              fontSize: "0.9rem",
              marginBottom: 20,
            }}
          >
            Kunde inte spara övningarna, försök igen. Kundens länk visar
            fortfarande det gamla innehållet.
            {detail && (
              <>
                <br />
                <span style={{ fontFamily: "monospace", fontSize: "0.82rem" }}>
                  Feldetalj: {detail}
                </span>
              </>
            )}
          </p>
        )}

        <ClinicProgramBuilder
          exercises={exercises ?? []}
          action={updateClinicProgram.bind(null, id)}
          initialLabel={program.label}
          initialSelected={initialSelected}
          submitLabel="Spara ändringar →"
          submitPendingText="Sparar..."
        />
      </div>
  );
}
