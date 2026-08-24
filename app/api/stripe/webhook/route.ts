import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return new Response("Webhook är inte konfigurerad", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response(`Ogiltig signatur: ${(err as Error).message}`, {
      status: 400,
    });
  }

  const supabase = createAdminClient();

  function planFromPriceId(priceId: string | undefined): string {
    if (priceId && priceId === process.env.STRIPE_COACHING_PRICE_ID) {
      return "premium_coaching";
    }
    return "premium";
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;

        if (userId && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );

          const { error } = await supabase.from("subscriptions").upsert(
            {
              user_id: userId,
              status: subscription.status,
              plan: planFromPriceId(subscription.items.data[0].price.id),
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              current_period_end: new Date(
                subscription.items.data[0].current_period_end * 1000,
              ).toISOString(),
            },
            { onConflict: "user_id" },
          );
          if (error) throw error;
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            plan: planFromPriceId(subscription.items.data[0].price.id),
            current_period_end: new Date(
              subscription.items.data[0].current_period_end * 1000,
            ).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        if (error) throw error;
        break;
      }

      default:
        break;
    }
  } catch (err) {
    // Svara med fel istället för att tyst låtsas lyckas — då markerar
    // Stripe leveransen som misslyckad (syns i Dashboard) och försöker
    // igen automatiskt, istället för att vi tappar uppdateringen helt.
    console.error("Stripe webhook: kunde inte uppdatera subscriptions", err);
    return new Response(`Databasfel: ${(err as Error).message}`, {
      status: 500,
    });
  }

  return new Response("ok", { status: 200 });
}
