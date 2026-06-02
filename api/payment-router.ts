import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { orders, transactions } from "@db/schema";
import { eq } from "drizzle-orm";

export const paymentRouter = createRouter({
  createPaymentIntent: authedQuery
    .input(z.object({ orderId: z.number(), method: z.enum(["stripe", "paypay", "konbini", "bank_transfer", "escrow"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const order = await db.query.orders.findFirst({ where: eq(orders.id, input.orderId) });
      if (!order || order.buyerId !== ctx.user.id) throw new Error("Unauthorized");
      const tx = await db.query.transactions.findFirst({ where: eq(transactions.orderId, input.orderId) });
      if (!tx) throw new Error("Transaction not found");
      return { success: true, transactionNumber: tx.transactionNumber, amount: tx.amount, currency: tx.currency, method: input.method, orderNumber: order.orderNumber };
    }),

  confirmPayment: authedQuery
    .input(z.object({ transactionNumber: z.string(), gatewayTransactionId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const tx = await db.query.transactions.findFirst({ where: eq(transactions.transactionNumber, input.transactionNumber) });
      if (!tx || tx.payerId !== ctx.user.id) throw new Error("Unauthorized");
      await db.update(transactions).set({ status: "completed", gatewayTransactionId: input.gatewayTransactionId || tx.gatewayTransactionId }).where(eq(transactions.id, tx.id));
      await db.update(orders).set({ status: "paid" }).where(eq(orders.id, tx.orderId));
      return { success: true };
    }),

  getPaymentMethods: publicQuery.query(async () => [
    { id: "stripe", name: "Credit Card (Visa/Mastercard/Amex)", icon: "credit-card", regions: ["global"], feePercent: 2.9, feeFixed: 0.30, available: true },
    { id: "paypay", name: "Japan mobile wallet (coming soon)", icon: "paypay", regions: ["JP"], feePercent: 1.5, feeFixed: 0, available: false },
    { id: "konbini", name: "Konbini (coming soon)", icon: "store", regions: ["JP"], feePercent: 2.0, feeFixed: 0, available: false },
    { id: "bank_transfer", name: "Bank transfer (coming soon)", icon: "landmark", regions: ["JP"], feePercent: 0, feeFixed: 0, available: false },
    { id: "escrow", name: "Escrow (held until delivery)", icon: "shield", regions: ["global"], feePercent: 0, feeFixed: 0, available: true },
  ]),

  getAvailableMethods: publicQuery.input(z.object({ countryCode: z.string().default("US") })).query(async ({ input }) => {
    const all = [
      { id: "stripe", name: "Credit Card", icon: "credit-card", regions: ["global"], feePercent: 2.9, feeFixed: 0.30 },
      { id: "paypay", name: "Japan mobile wallet", icon: "paypay", regions: ["JP"], feePercent: 1.5, feeFixed: 0 },
      { id: "konbini", name: "Konbini", icon: "store", regions: ["JP"], feePercent: 2.0, feeFixed: 0 },
      { id: "bank_transfer", name: "Bank Transfer", icon: "landmark", regions: ["JP"], feePercent: 0, feeFixed: 0 },
      { id: "escrow", name: "Escrow", icon: "shield", regions: ["global"], feePercent: 3.5, feeFixed: 0 },
    ];
    const filtered = input.countryCode === "JP" ? all : all.filter((m) => m.regions.includes("global"));
    return filtered.map((m) => ({ ...m, available: m.id === "stripe" || m.id === "escrow" }));
  }),

  refundRequest: authedQuery.input(z.object({ transactionNumber: z.string(), reason: z.string().min(1).max(1000) })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const tx = await db.query.transactions.findFirst({ where: eq(transactions.transactionNumber, input.transactionNumber) });
    if (!tx || tx.payerId !== ctx.user.id) throw new Error("Unauthorized");
    await db.update(transactions).set({ status: "disputed" }).where(eq(transactions.id, tx.id));
    await db.update(orders).set({ status: "disputed" }).where(eq(orders.id, tx.orderId));
    return { success: true, message: "Refund request noted. Contact your payment processor directly for the actual refund." };
  }),
});
