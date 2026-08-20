import Stripe from "stripe";

// Placeholder-nyckel så modulen kan laddas (t.ex. vid statisk analys av
// route handlers) innan STRIPE_SECRET_KEY är konfigurerat. Riktiga anrop
// mot Stripe misslyckas ändå tydligt om nyckeln saknas.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_placeholder");
