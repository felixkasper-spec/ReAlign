import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("u");
  const token = req.nextUrl.searchParams.get("t");

  if (!userId || !token || !verifyUnsubscribeToken(userId, token)) {
    return NextResponse.redirect(new URL("/avprenumererad?status=error", req.url));
  }

  const admin = createAdminClient();
  await admin.from("profiles").update({ marketing_emails: false }).eq("id", userId);

  return NextResponse.redirect(new URL("/avprenumererad?status=ok", req.url));
}
