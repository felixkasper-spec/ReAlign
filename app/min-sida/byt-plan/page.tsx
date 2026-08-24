import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubmitButton from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { confirmPlanChange } from "../actions";
import styles from "./page.module.css";

const planLabels: Record<string, { name: string; price: number }> = {
  premium: { name: "Premium", price: 149 },
  premium_coaching: { name: "Premium Coaching", price: 449 },
};

export default async function BytPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const { to } = await searchParams;
  const targetPlan = to === "premium" || to === "premium_coaching" ? to : null;

  if (!targetPlan) {
    redirect("/min-sida");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status, stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasActive =
    sub?.stripe_subscription_id &&
    (sub.status === "active" || sub.status === "trialing");

  if (!hasActive || sub.plan === targetPlan) {
    redirect("/min-sida");
  }

  const priceId =
    targetPlan === "premium_coaching"
      ? process.env.STRIPE_COACHING_PRICE_ID
      : process.env.STRIPE_PRICE_ID;

  const stripeSub = await stripe.subscriptions.retrieve(
    sub.stripe_subscription_id as string,
  );

  let previewAmount: number | null = null;
  if (priceId) {
    try {
      const preview = await stripe.invoices.createPreview({
        subscription: sub.stripe_subscription_id as string,
        subscription_details: {
          items: [{ id: stripeSub.items.data[0].id, price: priceId }],
          proration_behavior: "always_invoice",
        },
      });
      previewAmount = preview.amount_due;
    } catch {
      previewAmount = null;
    }
  }

  const target = planLabels[targetPlan];
  const current = planLabels[sub.plan ?? "premium"] ?? planLabels.premium;
  const confirmAction = confirmPlanChange.bind(null, targetPlan);

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <span className="eyebrow">Bekräfta bytet</span>
        <h1>Byt till {target.name}</h1>
        <p className={styles.text}>
          Du byter från {current.name} ({current.price} kr/mån) till{" "}
          {target.name} ({target.price} kr/mån). Bytet gäller direkt.
        </p>

        {previewAmount !== null && (
          <p className={styles.amount}>
            {previewAmount >= 0
              ? `Du debiteras ${(previewAmount / 100).toFixed(0)} kr nu`
              : `Du krediteras ${(Math.abs(previewAmount) / 100).toFixed(0)} kr`}{" "}
            för mellanskillnaden i den här perioden, sedan {target.price} kr/mån
            framöver.
          </p>
        )}

        <div className={styles.actions}>
          <form action={confirmAction}>
            <SubmitButton className="btn btn-primary" pendingText="Byter...">
              Bekräfta bytet →
            </SubmitButton>
          </form>
          <Link
            href="/min-sida"
            className="btn btn-ghost"
            style={{ border: "1px solid var(--line)" }}
          >
            Avbryt
          </Link>
        </div>

        <Footer />
      </div>
    </>
  );
}
