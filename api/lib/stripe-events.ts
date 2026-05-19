import Stripe from "stripe";
import { getDb } from "../queries/connection";
import { users, marketplaceListings, orders, transactions } from "@db/schema";
import { eq } from "drizzle-orm";

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  const db = getDb();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (!orderId) return;

    const platformFee = session.metadata?.platformFee;
    await db.update(orders)
      .set({
        status: "paid",
        feeAmount: platformFee || undefined,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, parseInt(orderId, 10)));

    await db.update(transactions)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(transactions.orderId, parseInt(orderId, 10)));

    const listingId = session.metadata?.listingId;
    if (listingId) {
      await db.update(marketplaceListings)
        .set({ isActive: false })
        .where(eq(marketplaceListings.id, parseInt(listingId, 10)));
    }
    return;
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    const complete = !!(account.charges_enabled && account.payouts_enabled);
    await db.update(users)
      .set({ stripeOnboardingComplete: complete })
      .where(eq(users.stripeAccountId, account.id));
  }
}
