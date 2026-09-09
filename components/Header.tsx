import { createClient } from "@/lib/supabase/server";
import { isClinicStaffEmail } from "@/lib/coach";
import HeaderClient from "./HeaderClient";

export default async function Header({ transparent }: { transparent?: boolean } = {}) {
  let loggedIn = false;
  let isClinicStaff = false;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    loggedIn = !!user;
    isClinicStaff = isClinicStaffEmail(user?.email);
  }

  return (
    <HeaderClient loggedIn={loggedIn} isClinicStaff={isClinicStaff} transparent={transparent} />
  );
}
