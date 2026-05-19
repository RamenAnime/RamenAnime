import { createStripeClient } from "./stripe";
import { getDb } from "../queries/connection";
import { auctionDeposits, marketplaceListings } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { getRequiredDeposit } from "./auction-engine";

const stripe = createStripeClient(process.env.STRIPE_SECRET_KEY || "");

export async function createAuctionDepositCheckout(input: {
  listingId: number;
  bidderId: number;
  bidderEmail?: string | null;
}): Promise<{ checkoutUrl: string; amount: number; alreadyPaid: boolean }> {
  const db = getDb();
  const listing = await db.query.marketplaceListings.findFirst({
    where: eq(marketplaceListings.id, input.listingId),
  });
  if (!listing) throw new Error("Listing not found");

  const amount = getRequiredDeposit(parseFloat(listing.startPrice || "0"));
  const existing = await db.query.auctionDeposits.findFirst({
    where: and(
      eq(auctionDeposits.listingId, input.listingId),
      eq(auctionDeposits.bidderId, input.bidderId)
    ),
  });
  if (existing?.status === "held") {
    return { checkoutUrl: "", amount, alreadyPaid: true };
  }

  const amountCents = Math.round(amount * 100);
  const site = process.env.SITE_URL || "https://ramenanime.com";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: input.bidderEmail || undefined,
    line_items: [{
      price_data: {
        currency: "usd",
        unit_amount: amountCents,
        product_data: {
          name: `Auction bid deposit - ${listing.title}`,
          description: "Refundable hold for high-value auctions (5% of start price, min $500)",
        },
      },
      quantity: 1,
    }],
    payment_intent_data: {
      capture_method: "manual",
      metadata: {
        type: "auction_deposit",
        listingId: String(input.listingId),
        bidderId: String(input.bidderId),
      },
    },
    metadata: {
      type: "auction_deposit",
      listingId: String(input.listingId),
      bidderId: String(input.bidderId),
    },
    success_url: `${site}/marketplace/${input.listingId}?deposit=success`,
    cancel_url: `${site}/marketplace/${input.listingId}?deposit=cancel`,
  });

  const intentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (existing) {
    await db
      .update(auctionDeposits)
      .set({
        amount: amount.toFixed(2),
        status: "pending",
        stripePaymentIntentId: intentId || session.id,
      })
      .where(eq(auctionDeposits.id, existing.id));
  } else {
    await db.insert(auctionDeposits).values({
      listingId: input.listingId,
      bidderId: input.bidderId,
      amount: amount.toFixed(2),
      status: "pending",
      stripePaymentIntentId: intentId || session.id,
    });
  }

  if (!session.url) throw new Error("Failed to create deposit checkout");
  return { checkoutUrl: session.url, amount, alreadyPaid: false };
}

export async function markDepositHeld(listingId: number, bidderId: number, paymentIntentId: string) {
  const db = getDb();
  await db
    .update(auctionDeposits)
    .set({ status: "held", stripePaymentIntentId: paymentIntentId })
    .where(
      and(eq(auctionDeposits.listingId, listingId), eq(auctionDeposits.bidderId, bidderId))
    );
}
