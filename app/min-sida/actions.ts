"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/base-url";
import { getSubscription } from "@/lib/subscription";
import {
  COACHING_ATTACHMENT_BUCKET,
  MAX_ATTACHMENT_BYTES,
  attachmentTypeFromMime,
} from "@/lib/coaching-attachments";

export async function createCheckoutSession(
  plan: "premium" | "premium_coaching" = "premium",
  interval: "month" | "year" = "month",
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
      : interval === "year"
        ? process.env.STRIPE_PRICE_ID_YEARLY
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
    // 50% rabatt första månaden, bara för nya Premium-prenumeranter som
    // betalar månadsvis — den här kodvägen nås aldrig av någon som redan
    // har ett aktivt abonnemang (de skickas till byt-plan istället, se
    // ovan), så rabatten kan aldrig råka appliceras på ett planbyte.
    // Årsvis har redan 25% rabatt inbakat i priset och kombineras inte
    // med introrabatten.
    discounts:
      plan === "premium" && interval === "month"
        ? [{ coupon: "premium50first" }]
        : undefined,
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

export async function updateMarketingEmails(optIn: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.from("profiles").update({ marketing_emails: optIn }).eq("id", user.id);
  revalidatePath("/min-sida");
}

async function requireCoachingUser() {
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

  return { supabase, user };
}

export async function sendCoachingMessage(formData: FormData) {
  const { supabase, user } = await requireCoachingUser();

  const body = String(formData.get("body") ?? "").trim();
  const attachmentPath = formData.get("attachment_path");
  const attachmentType = formData.get("attachment_type");

  if (!body && !attachmentPath) {
    return;
  }

  await supabase.from("coaching_messages").insert({
    user_id: user.id,
    sender: "user",
    body,
    attachment_path: attachmentPath ? String(attachmentPath) : null,
    attachment_type: attachmentType ? String(attachmentType) : null,
  });

  revalidatePath("/min-sida/coaching");
}

export async function createAttachmentUploadUrl(fileName: string, fileSize: number, mime: string) {
  const { supabase, user } = await requireCoachingUser();

  if (fileSize > MAX_ATTACHMENT_BYTES) {
    throw new Error("Filen är för stor (max 25 MB).");
  }

  const type = attachmentTypeFromMime(mime);
  if (!type) {
    throw new Error("Bara bilder och videor kan bifogas.");
  }

  const ext = fileName.split(".").pop()?.toLowerCase() || "bin";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(COACHING_ATTACHMENT_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    throw new Error("Kunde inte förbereda uppladdningen.");
  }

  return { path, token: data.token, type };
}
