"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/base-url";
import { getSubscription } from "@/lib/subscription";

export async function createCheckoutSession(
  plan: "premium" | "premium_coaching" = "premium",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const origin = await getBaseUrl();
  const priceId =
    plan === "premium_coaching"
      ? process.env.STRIPE_COACHING_PRICE_ID
      : process.env.STRIPE_PRICE_ID;

  if (!priceId) {
    redirect("/min-sida?checkout=not_configured");
  }

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id, stripe_subscription_id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasActiveSubscription =
    existing?.stripe_subscription_id &&
    (existing.status === "active" || existing.status === "trialing");

  // Redan prenumerant som byter nivå: en direkt Checkout Session skulle
  // skapa en konkurrerande prenumeration. Skicka till bekräftelsesidan
  // istället, som visar prisskillnaden innan bytet faktiskt görs.
  if (hasActiveSubscription) {
    redirect(`/min-sida/byt-plan?to=${plan}`);
  }

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

export async function confirmPlanChange(plan: "premium" | "premium_coaching") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasActiveSubscription =
    existing?.stripe_subscription_id &&
    (existing.status === "active" || existing.status === "trialing");

  if (!hasActiveSubscription) {
    redirect("/min-sida");
  }

  const priceId =
    plan === "premium_coaching"
      ? process.env.STRIPE_COACHING_PRICE_ID
      : process.env.STRIPE_PRICE_ID;

  if (!priceId) {
    redirect("/min-sida?checkout=not_configured");
  }

  const subscription = await stripe.subscriptions.retrieve(
    existing.stripe_subscription_id as string,
  );

  // always_invoice fakturerar och drar mellanskillnaden direkt istället för
  // att bara lägga den som en kredit på nästa förnyelsefaktura — annars ser
  // det ut som att bytet var gratis fram till förnyelsedatumet.
  await stripe.subscriptions.update(existing.stripe_subscription_id as string, {
    items: [{ id: subscription.items.data[0].id, price: priceId }],
    proration_behavior: "always_invoice",
  });

  redirect("/min-sida?checkout=success");
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

export async function sendCoachingMessage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const subscription = await getSubscription();
  if (!subscription.active || subscription.plan !== "premium_coaching") {
    redirect("/min-sida");
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return;
  }

  await supabase.from("coaching_messages").insert({
    user_id: user.id,
    sender: "user",
    body,
  });

  revalidatePath("/min-sida/coaching");
}
