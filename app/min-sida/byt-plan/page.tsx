import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SubmitButton from "@/components/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { confirmPlanChange } from "../actions";
import styles from "./page.module.css";

const planLabels: Record<string, { name: string; price: number; unit: string }> = {
  premium: { name: "Premium (månadsvis)", price: 149, unit: "kr/mån" },
  premium_yearly: { name: "Premium (årsvis)", price: 1341, unit: "kr/år" },
  premium_coaching: { name: "Premium Coaching", price: 449, unit: "kr/mån" },
};

export default async function BytPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const { to } = await searchParams;
  const targetPlan =
    to === "premium" || to === "premium_yearly" || to === "premium_coaching" ? to : null;

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

  if (!hasActive) {
    redirect("/min-sida");
  }

  const stripeSub = await stripe.subscriptions.retrieve(
    sub.stripe_subscription_id as string,
  );

  // "plan" i databasen skiljer bara på premium/premium_coaching, inte
  // betalningsintervall — det läser vi istället direkt från Stripe, som
  // är den faktiska källan till sanning för vilket pris kunden har nu.
  const currentInterval = stripeSub.items.data[0].price.recurring?.interval;
  const currentPlan =
    sub.plan === "premium_coaching"
      ? "premium_coaching"
      : currentInterval === "year"
        ? "premium_yearly"
        : "premium";

  if (currentPlan === targetPlan) {
    redirect("/min-sida");
  }

  const priceId =
    targetPlan === "premium_coaching"
      ? process.env.STRIPE_COACHING_PRICE_ID
      : targetPlan === "premium_yearly"
        ? process.env.STRIPE_PRICE_ID_YEARLY
        : process.env.STRIPE_PRICE_ID;

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
  const current = planLabels[currentPlan];
  const confirmAction = confirmPlanChange.bind(null, targetPlan);

  return (
    <>
      <Header />
      <div className={`wrap ${styles.wrap}`}>
        <span className="eyebrow">Bekräfta bytet</span>
        <h1>Byt till {target.name}</h1>
        <p className={styles.text}>
          Du byter från {current.name} ({current.price} {current.unit}) till{" "}
          {target.name} ({target.price} {target.unit}). Bytet gäller direkt.
        </p>

        {previewAmount !== null && (
          <p className={styles.amount}>
            {previewAmount >= 0
              ? `Du debiteras ${(previewAmount / 100).toFixed(0)} kr nu`
              : `Du krediteras ${(Math.abs(previewAmount) / 100).toFixed(0)} kr`}{" "}
            för mellanskillnaden i den här perioden, sedan {target.price}{" "}
            {target.unit} framöver.
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
