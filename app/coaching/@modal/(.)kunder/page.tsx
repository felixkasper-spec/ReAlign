import AdminModal from "../../AdminModal";
import { CustomersContent } from "../../kunder/page";

// Intercepterar klick från andra /coaching-sidor till /coaching/kunder och
// visar den som popup istället för att byta sida — direktlänk/refresh går
// fortfarande till den riktiga sidan (app/coaching/kunder/page.tsx) som
// renderas helt oförändrad.
export default function KunderModalPage() {
  return (
    <AdminModal fullHref="/coaching/kunder">
      <CustomersContent />
    </AdminModal>
  );
}
