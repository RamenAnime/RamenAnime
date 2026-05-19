import Stripe from "stripe";

const STRIPE_API_VERSION = "2025-04-30.basil" as Stripe.LatestApiVersion;

export function createStripeClient(secretKey: string): Stripe {
  return new Stripe(secretKey, { apiVersion: STRIPE_API_VERSION });
}
