import AdminModal from "../../AdminModal";
import { LeadsContent } from "../../leads/page";

// Intercepterar klick från andra /coaching-sidor till /coaching/leads och
// visar den som popup istället för att byta sida — direktlänk/refresh går
// fortfarande till den riktiga sidan (app/coaching/leads/page.tsx) som
// renderas helt oförändrad.
export default async function LeadsModalPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; owner?: string; q?: string }>;
}) {
  const sp = await searchParams;
  return (
    <AdminModal fullHref="/coaching/leads">
      <LeadsContent {...sp} />
    </AdminModal>
  );
}
