import type { Context } from "hono";
  import Stripe from "stripe";
  import { getDb } from "./queries/connection";
import { orders, transactions, users } from "@db/schema";
import { eq } from "drizzle-orm";
import { logger } from "./lib/utils/logger";
import { markDepositHeld } from "./lib/stripe-deposit";

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-04-30.basil",
  });

  export async function handleStripeWebhook(c: Context): Promise<Response> {
    const sig = c.req.header("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      logger.warn("Stripe webhook: missing signature or secret");
      return c.json({ error: "Missing webhook signature or secret" }, 400);
    }

    let rawBody: string;
    try {
      rawBody = await c.req.text();
    } catch {
      return c.json({ error: "Failed to read request body" }, 400);
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      logger.warn("Stripe webhook signature verification failed", { error: (err as Error).message });
      return c.json({ error: "Webhook signature verification failed" }, 400);
    }

    try {
      const db = getDb();

      switch (event.type) {
        case "payment_intent.succeeded": {
          const intent = event.data.object as Stripe.PaymentIntent;
          const txn = await db.query.transactions.findFirst({
            where: eq(transactions.gatewayTransactionId, intent.id),
          });
          if (txn) {
            await db.update(transactions).set({ status: "completed" }).where(eq(transactions.id, txn.id));
            await db.update(orders).set({ status: "paid" }).where(eq(orders.id, txn.orderId));
            logger.info("Payment intent succeeded", { intentId: intent.id, orderId: txn.orderId });
          }
          break;
        }

        case "payment_intent.payment_failed": {
          const intent = event.data.object as Stripe.PaymentIntent;
          const txn = await db.query.transactions.findFirst({
            where: eq(transactions.gatewayTransactionId, intent.id),
          });
          if (txn) {
            await db.update(transactions).set({ status: "failed" }).where(eq(transactions.id, txn.id));
            logger.warn("Payment intent failed", { intentId: intent.id, orderId: txn.orderId });
          }
          break;
        }

        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.metadata?.type === "auction_deposit") {
            const listingId = parseInt(session.metadata.listingId || "0", 10);
            const bidderId = parseInt(session.metadata.bidderId || "0", 10);
            const intentId =
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent?.id || session.id;
            if (listingId && bidderId) {
              await markDepositHeld(listingId, bidderId, intentId);
              logger.info("Auction deposit held", { listingId, bidderId, intentId });
            }
            break;
          }
          if (session.payment_intent) {
            const intentId =
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : session.payment_intent.id;
            const txn = await db.query.transactions.findFirst({
              where: eq(transactions.gatewayTransactionId, intentId),
            });
            if (txn) {
              await db.update(transactions).set({ status: "completed" }).where(eq(transactions.id, txn.id));
              await db.update(orders).set({ status: "paid" }).where(eq(orders.id, txn.orderId));
              logger.info("Checkout session completed", { intentId, orderId: txn.orderId });
            }
          }
          break;
        }

        case "account.updated": {
          const account = event.data.object as Stripe.Account;
          if (account.details_submitted) {
            await db
              .update(users)
              .set({ stripeOnboardingComplete: true })
              .where(eq(users.stripeAccountId, account.id));
            logger.info("Stripe Connect onboarding complete", { accountId: account.id });
          }
          break;
        }

        default:
          logger.info("Unhandled Stripe webhook event", { type: event.type });
      }

      return c.json({ received: true });
    } catch (err) {
      logger.error("Stripe webhook handler error", {
        error: (err as Error).message,
        type: event.type,
      });
      return c.json({ error: "Internal server error" }, 500);
    }
  }
  