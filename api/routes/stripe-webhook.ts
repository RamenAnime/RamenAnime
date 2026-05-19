import type { Context } from "hono";
import type Stripe from "stripe";
import { createStripeClient } from "../lib/stripe";
import { handleStripeWebhookEvent } from "../lib/stripe-events";

const stripe = createStripeClient(process.env.STRIPE_SECRET_KEY || "");

export async function stripeWebhookHandler(c: Context) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return c.json({ error: "STRIPE_WEBHOOK_SECRET not configured" }, 500);
  }

  const signature = c.req.header("stripe-signature");
  if (!signature) {
    return c.json({ error: "Missing stripe-signature header" }, 400);
  }

  const rawBody = await c.req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return c.json({ error: message }, 400);
  }

  try {
    await handleStripeWebhookEvent(event);
    return c.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handler failed";
    console.error("[stripe webhook]", message);
    return c.json({ error: message }, 500);
  }
}
