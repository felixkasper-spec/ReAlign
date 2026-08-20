"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/base-url";

export async function createCheckoutSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const origin = await getBaseUrl();
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!priceId) {
    redirect("/min-sida?checkout=not_configured");
  }

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer: existing?.stripe_customer_id ?? undefined,
    customer_email: existing?.stripe_customer_id ? undefined : user.email,
    client_reference_id: user.id,
    success_url: `${origin}/min-sida?checkout=success`,
    cancel_url: `${origin}/min-sida?checkout=cancel`,
    // Managed Payments kräver en momskod per produkt som vi inte satt upp
    // (vi sköter momshanteringen på annat håll) — stäng av den här.
    managed_payments: { enabled: false },
  });

  if (!session.url) {
    redirect("/min-sida?checkout=error");
  }

  redirect(session.url);
}

export async function openBillingPortal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    redirect("/min-sida");
  }

  const origin = await getBaseUrl();

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${origin}/min-sida`,
  });

  redirect(session.url);
}
