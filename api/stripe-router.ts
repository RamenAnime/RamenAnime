import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, marketplaceListings, orders, transactions, geoVerifications } from "@db/schema";
import { eq, and } from "drizzle-orm";
import { createStripeClient } from "./lib/stripe";
const stripe = createStripeClient(process.env.STRIPE_SECRET_KEY || "");

import { calculateMarketplaceFees } from "./lib/platform-fees";

function generateOrderNumber() {
  return "ORD-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

function generateTransactionNumber() {
  return "TXN-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

export const stripeRouter = createRouter({
  // Check if seller has connected Stripe account
  getSellerStatus: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.id, ctx.user.id),
      columns: { stripeAccountId: true, stripeOnboardingComplete: true },
    });
    return {
      connected: !!user?.stripeAccountId,
      onboardingComplete: user?.stripeOnboardingComplete || false,
    };
  }),

  getSellerStatusByUserId: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const user = await db.query.users.findFirst({
        where: eq(users.id, input.userId),
        columns: { stripeAccountId: true, stripeOnboardingComplete: true },
      });
      return {
        connected: !!user?.stripeAccountId,
        onboardingComplete: !!user?.stripeOnboardingComplete,
      };
    }),

  syncOnboardingStatus: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    const user = await db.query.users.findFirst({ where: eq(users.id, ctx.user.id) });
    if (!user?.stripeAccountId) return { onboardingComplete: false };
    const account = await stripe.accounts.retrieve(user.stripeAccountId);
    const complete = account.charges_enabled && account.payouts_enabled;
    await db.update(users)
      .set({ stripeOnboardingComplete: complete })
      .where(eq(users.id, ctx.user.id));
    return { onboardingComplete: complete };
  }),

  // Create Stripe Connect onboarding link for seller
  createOnboardingLink: authedQuery.mutation(async ({ ctx }) => {
    const db = getDb();
    let user = await db.query.users.findFirst({ where: eq(users.id, ctx.user.id) });

    // Create Stripe Express account if not exists
    if (!user?.stripeAccountId) {
      // Look up user's verified country from geo-verification, fallback to "US"
      const geo = await db.query.geoVerifications.findFirst({
        where: eq(geoVerifications.userId, ctx.user.id),
        columns: { countryCode: true },
      });
      const country = geo?.countryCode || "US";

      const account = await stripe.accounts.create({
        type: "express",
        country,
        email: user?.email || undefined,
        business_type: "individual",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      await db.update(users)
        .set({ stripeAccountId: account.id })
        .where(eq(users.id, ctx.user.id));

      user = { ...user, stripeAccountId: account.id };
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: user.stripeAccountId!,
      refresh_url: `${process.env.SITE_URL || "https://ramenanime.com"}/seller/stripe-return?success=false`,
      return_url: `${process.env.SITE_URL || "https://ramenanime.com"}/seller/stripe-return?success=true`,
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  }),

  // Create a checkout session for buyer to pay
  createCheckoutSession: authedQuery
    .input(z.object({ listingId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const listing = await db.query.marketplaceListings.findFirst({
        where: eq(marketplaceListings.id, input.listingId),
        with: { seller: true },
      });
      if (!listing) throw new Error("Listing not found");
      if (!listing.seller?.stripeAccountId) throw new Error("Seller has not connected a payment account");
      if (!listing.seller?.stripeOnboardingComplete) throw new Error("Seller payment account is not fully set up");

      const unitPrice = listing.listingType === "auction"
        ? (listing.currentBid || listing.price || listing.buyNowPrice || "0")
        : (listing.price || listing.buyNowPrice || "0");
      const priceCents = Math.round(parseFloat(unitPrice) * 100);
      if (priceCents <= 0) throw new Error("Invalid listing price");

      const { totalCents, applicationFeeCents, sellerReceivesCents } =
        calculateMarketplaceFees(priceCents);

      // Create order record
      const orderNum = generateOrderNumber();
      const [{ id: orderId }] = await db.insert(orders).values({
        orderNumber: orderNum,
        buyerId: ctx.user.id,
        sellerId: listing.sellerId,
        listingId: input.listingId,
        totalAmount: (totalCents / 100).toFixed(2),
        feeAmount: (applicationFeeCents / 100).toFixed(2),
        currency: "USD",
        status: "pending",
      }).$returningId();

      // Create transaction record
      await db.insert(transactions).values({
        transactionNumber: generateTransactionNumber(),
        orderId,
        payerId: ctx.user.id,
        payeeId: listing.sellerId,
        amount: (totalCents / 100).toFixed(2),
        currency: "USD",
        paymentMethod: "stripe",
        status: "pending",
      });

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            unit_amount: totalCents,
            product_data: {
              name: listing.title,
              description: `Ramen Anime Marketplace - ${listing.title}`,
              images: listing.thumbnail ? [listing.thumbnail] : undefined,
            },
          },
          quantity: 1,
        }],
        payment_intent_data: {
          application_fee_amount: applicationFeeCents,
          transfer_data: {
            destination: listing.seller.stripeAccountId,
          },
        },
        mode: "payment",
        success_url: `${process.env.SITE_URL || "https://ramenanime.com"}/marketplace/${input.listingId}?payment=success&order=${orderNum}`,
        cancel_url: `${process.env.SITE_URL || "https://ramenanime.com"}/marketplace/${input.listingId}?payment=cancel`,
        metadata: {
          orderId: orderId.toString(),
          listingId: input.listingId.toString(),
          buyerId: ctx.user.id.toString(),
          sellerId: listing.sellerId.toString(),
          platformFee: (applicationFeeCents / 100).toFixed(2),
          sellerReceives: (sellerReceivesCents / 100).toFixed(2),
        },
      });

      return {
        url: session.url,
        orderNumber: orderNum,
        total: (totalCents / 100).toFixed(2),
        platformFee: (applicationFeeCents / 100).toFixed(2),
        sellerReceives: (sellerReceivesCents / 100).toFixed(2),
      };
    }),

  // Get my orders (buyer)
  myOrders: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.orders.findMany({
      where: eq(orders.buyerId, ctx.user.id),
      with: { listing: true, seller: true },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });
  }),

  // Get my sales (seller)
  mySales: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.orders.findMany({
      where: eq(orders.sellerId, ctx.user.id),
      with: { listing: true, buyer: true },
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });
  }),

  // Seller marks order as shipped
  markShipped: authedQuery
    .input(z.object({
      orderId: z.number(),
      trackingNumber: z.string().optional(),
      carrier: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({ where: eq(orders.id, input.orderId) });
      if (!order || order.sellerId !== ctx.user.id) throw new Error("Unauthorized");

      await db.update(orders).set({
        status: "shipped",
        trackingNumber: input.trackingNumber || null,
        shippingCarrier: input.carrier || null,
        updatedAt: new Date(),
      }).where(eq(orders.id, input.orderId));

      return { success: true };
    }),

  // Buyer marks order as received
  markReceived: authedQuery
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({ where: eq(orders.id, input.orderId) });
      if (!order || order.buyerId !== ctx.user.id) throw new Error("Unauthorized");

      await db.update(orders).set({
        status: "delivered",
        updatedAt: new Date(),
      }).where(eq(orders.id, input.orderId));

      return { success: true };
    }),

  // Get order details
  getOrder: authedQuery
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: { listing: true, buyer: true, seller: true },
      });
      if (!order) throw new Error("Order not found");
      if (order.buyerId !== ctx.user.id && order.sellerId !== ctx.user.id) throw new Error("Unauthorized");
      return order;
    }),
});
