import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, transactions, notifications } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const disputeRouter = createRouter({
  openDispute: authedQuery
    .input(z.object({
      orderId: z.number(),
      reason: z.enum(["not_delivered", "not_as_described", "damaged", "counterfeit", "unauthorized_payment", "other"]),
      description: z.string().min(10).max(2000),
      evidence: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: { buyer: true, seller: true, listing: true },
      });
      if (!order) throw new Error("Order not found");
      if (order.buyerId !== ctx.user.id && order.sellerId !== ctx.user.id) {
        throw new Error("Only buyer or seller can open a dispute");
      }
      await db.update(orders).set({ status: "disputed" }).where(eq(orders.id, input.orderId));
      await db.insert(notifications).values({
        userId: order.sellerId, type: "dispute_opened",
        title: "Dispute opened on your order",
        message: `Dispute for order #${order.orderNumber}. Reason: ${input.reason}`,
        link: `/orders/${input.orderId}`,
      });
      return { success: true, disputeId: input.orderId };
    }),

  respondToDispute: authedQuery
    .input(z.object({ orderId: z.number(), response: z.string().min(10).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({ where: eq(orders.id, input.orderId) });
      if (!order || (order.buyerId !== ctx.user.id && order.sellerId !== ctx.user.id)) {
        throw new Error("Unauthorized");
      }
      const otherId = order.buyerId === ctx.user.id ? order.sellerId : order.buyerId;
      await db.insert(notifications).values({
        userId: otherId, type: "dispute_response",
        title: "New dispute response",
        message: `Response added to dispute on order #${order.orderNumber}.`,
        link: `/orders/${input.orderId}`,
      });
      return { success: true };
    }),

  escalateToProcessor: authedQuery
    .input(z.object({ orderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: { transactions: true },
      });
      if (!order || order.buyerId !== ctx.user.id) throw new Error("Only buyer can escalate");
      const tx = order.transactions?.[0];
      await db.insert(notifications).values({
        userId: ctx.user.id, type: "dispute_escalated",
        title: "Dispute escalated to payment processor",
        message: `Order #${order.orderNumber} escalated to ${tx?.paymentMethod || "payment processor"}. Contact them directly for fastest resolution.`,
        link: `/orders/${input.orderId}`,
      });
      return { success: true, processor: tx?.paymentMethod || "your payment provider" };
    }),

  getDisputeStatus: authedQuery
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: { buyer: true, seller: true, listing: true, transactions: true, tracking: true },
      });
      if (!order || (order.buyerId !== ctx.user.id && order.sellerId !== ctx.user.id)) {
        throw new Error("Unauthorized");
      }
      return {
        isDisputed: order.status === "disputed",
        status: order.status,
        escrowStatus: order.escrowStatus,
        canEscalate: order.status === "disputed" && order.buyerId === ctx.user.id,
        order,
      };
    }),

  getPendingDisputes: adminQuery.query(async () => {
    const db = getDb();
    return db.query.orders.findMany({
      where: eq(orders.status, "disputed"),
      with: { buyer: true, seller: true, listing: true },
      orderBy: desc(orders.updatedAt),
    });
  }),

  resolveDispute: adminQuery
    .input(z.object({
      orderId: z.number(),
      resolution: z.enum(["buyer_favor", "seller_favor", "split", "escalate"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({ where: eq(orders.id, input.orderId) });
      if (!order) throw new Error("Order not found");
      if (input.resolution === "buyer_favor") {
        await db.update(orders).set({ status: "refunded", escrowStatus: "refunded" }).where(eq(orders.id, input.orderId));
        await db.update(transactions).set({ status: "refunded" }).where(eq(transactions.orderId, input.orderId));
      } else if (input.resolution === "seller_favor") {
        await db.update(orders).set({ status: "delivered", escrowStatus: "released" }).where(eq(orders.id, input.orderId));
        await db.update(transactions).set({ status: "completed" }).where(eq(transactions.orderId, input.orderId));
      }
      await db.insert(notifications).values({
        userId: order.buyerId, type: "dispute_resolved",
        title: "Dispute resolved", message: `Order #${order.orderNumber} resolved: ${input.resolution}.`,
        link: `/orders/${input.orderId}`,
      });
      await db.insert(notifications).values({
        userId: order.sellerId, type: "dispute_resolved",
        title: "Dispute resolved", message: `Order #${order.orderNumber} resolved: ${input.resolution}.`,
        link: `/orders/${input.orderId}`,
      });
      return { success: true };
    }),
});
