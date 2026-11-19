import AdminModal from "../../../AdminModal";
import { KundDetailContent } from "../../../kunder/[phone]/page";

// Intercepterar klick från andra /coaching-sidor till /coaching/kunder/[phone]
// och visar den som popup istället för att byta sida — direktlänk/refresh
// går fortfarande till den riktiga sidan (app/coaching/kunder/[phone]/page.tsx)
// som renderas helt oförändrad.
export default async function KundModalPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const { phone } = await params;
  return (
    <AdminModal fullHref={`/coaching/kunder/${phone}`}>
      <KundDetailContent phone={phone} />
    </AdminModal>
  );
}
