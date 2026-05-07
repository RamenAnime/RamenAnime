import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, transactions, marketplaceListings, auctionBids } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

function generateOrderNumber() {
  return "ORD-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

function generateTransactionNumber() {
  return "TXN-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

export const orderRouter = createRouter({
  // Create order from a listing (when auction ends or buy-now clicked)
  createFromListing: authedQuery
    .input(z.object({ listingId: z.number(), amount: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const listing = await db.query.marketplaceListings.findFirst({
        where: eq(marketplaceListings.id, input.listingId),
      });
      if (!listing) throw new Error("Listing not found");

      // Check if order already exists
      const existing = await db.query.orders.findFirst({
        where: and(eq(orders.listingId, input.listingId), eq(orders.buyerId, ctx.user.id), eq(orders.status, "pending")),
      });
      if (existing) return { orderId: existing.id, orderNumber: existing.orderNumber, status: existing.status };

      const orderNum = generateOrderNumber();
      const [{ id }] = await db.insert(orders).values({
        orderNumber: orderNum,
        buyerId: ctx.user.id,
        sellerId: listing.sellerId,
        listingId: input.listingId,
        totalAmount: input.amount,
        currency: "USD",
        status: "pending",
      }).$returningId();

      // Also create transaction record
      await db.insert(transactions).values({
        transactionNumber: generateTransactionNumber(),
        orderId: id,
        payerId: ctx.user.id,
        payeeId: listing.sellerId,
        amount: input.amount,
        currency: "USD",
        paymentMethod: "credit_card",
        status: "pending",
      });

      return { orderId: id, orderNumber: orderNum, status: "pending" };
    }),

  // Get order for a listing (for buyer to see payment status)
  getByListing: authedQuery
    .input(z.object({ listingId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({
        where: and(eq(orders.listingId, input.listingId), eq(orders.buyerId, ctx.user.id)),
        with: { listing: true },
        orderBy: desc(orders.createdAt),
      });
      if (!order) return null;
      const tx = await db.query.transactions.findFirst({
        where: eq(transactions.orderId, order.id),
      });
      return { ...order, transaction: tx };
    }),

  // Get all my orders (buyer)
  myOrders: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.orders.findMany({
      where: eq(orders.buyerId, ctx.user.id),
      with: { listing: true, seller: true },
      orderBy: desc(orders.createdAt),
    });
  }),

  // Get all orders for my listings (seller)
  mySales: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.orders.findMany({
      where: eq(orders.sellerId, ctx.user.id),
      with: { listing: true, buyer: true },
      orderBy: desc(orders.createdAt),
    });
  }),

  // Mark order as paid (called after PayPal payment)
  markPaid: authedQuery
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({ where: eq(orders.id, input.orderId) });
      if (!order) throw new Error("Order not found");
      if (order.buyerId !== ctx.user.id) throw new Error("Unauthorized");

      await db.update(orders).set({ status: "paid", updatedAt: new Date() }).where(eq(orders.id, input.orderId));
      await db.update(transactions)
        .set({ status: "completed" })
        .where(eq(transactions.orderId, input.orderId));

      // Mark listing as sold
      await db.update(marketplaceListings)
        .set({ isActive: false })
        .where(eq(marketplaceListings.id, order.listingId));

      return { success: true };
    }),

  // Get PayPal payment URL for an order
  getPayPalUrl: authedQuery
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: { listing: true },
      });
      if (!order || order.buyerId !== ctx.user.id) throw new Error("Unauthorized");

      // Build PayPal.me link for payment
      const amount = order.totalAmount;
      return {
        orderNumber: order.orderNumber,
        amount: amount,
        currency: order.currency,
        payPalUrl: `https://www.paypal.com/paypalme/ramenanime/${amount}USD`,
        status: order.status,
      };
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

      await db.update(orders).set({ status: "delivered", updatedAt: new Date() }).where(eq(orders.id, input.orderId));
      return { success: true };
    }),
});
