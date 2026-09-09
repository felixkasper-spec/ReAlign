import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { requireClinicStaff } from "@/lib/coach";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateClinicProgram } from "../../actions";
import ClinicProgramBuilder, { type SelectedRow } from "../../ClinicProgramBuilder";
import styles from "../../../page.module.css";

export default async function EditClinicProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireClinicStaff();
  const { id } = await params;
  const admin = createAdminClient();

  const [{ data: program }, { data: exercises }, { data: rows }] = await Promise.all([
    admin.from("clinic_programs").select("id, label").eq("id", id).maybeSingle(),
    admin.from("exercises").select("id, slug, title, body_part").order("body_part").order("title"),
    admin
      .from("clinic_program_exercises")
      .select("notes, order_index, exercises ( id, title )")
      .eq("clinic_program_id", id)
      .order("order_index"),
  ]);

  if (!program) notFound();

  const initialSelected: SelectedRow[] = (rows ?? [])
    .map((r) => {
      const ex = r.exercises as unknown as { id: string; title: string } | null;
      if (!ex) return null;
      return { id: ex.id, title: ex.title, notes: r.notes ?? "" };
    })
    .filter((r): r is SelectedRow => r != null);

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <Link href={`/coaching/kundprogram/${id}`} className={styles.back}>
          ← Kundprogram
        </Link>
        <span className="eyebrow">Coach-verktyg</span>
        <h1>Redigera kundprogram</h1>
        <p style={{ color: "var(--text-soft)", marginBottom: 24 }}>
          Länken kunden redan har fortsätter fungera — sparar du ändras bara innehållet den visar.
        </p>

        <ClinicProgramBuilder
          exercises={exercises ?? []}
          action={updateClinicProgram.bind(null, id)}
          initialLabel={program.label}
          initialSelected={initialSelected}
          submitLabel="Spara ändringar →"
          submitPendingText="Sparar..."
        />

        <Footer />
      </div>
    </>
  );
}
