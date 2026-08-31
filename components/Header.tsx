import { createClient } from "@/lib/supabase/server";
import HeaderClient from "./HeaderClient";

export default async function Header({ transparent }: { transparent?: boolean } = {}) {
  let loggedIn = false;
  let userId: string | null = null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    loggedIn = !!user;
    userId = user?.id ?? null;
  }

  return <HeaderClient loggedIn={loggedIn} userId={userId} transparent={transparent} />;
}
