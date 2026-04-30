import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { donations } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const donationRouter = createRouter({
  create: publicQuery
    .input(
      z.object({
        donorName: z.string().max(255).optional(),
        donorEmail: z.string().email().optional(),
        amount: z.string().min(1).max(50),
        currency: z.string().min(3).max(10).default("USD"),
        countryCode: z.string().max(10).optional(),
        paymentMethod: z.string().min(1).max(50),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(donations).values({
        donorName: input.donorName ?? "Anonymous",
        donorEmail: input.donorEmail ?? null,
        amount: input.amount,
        currency: input.currency.toUpperCase(),
        countryCode: input.countryCode ?? null,
        paymentMethod: input.paymentMethod,
        message: input.message ?? null,
        paymentStatus: "pending",
      }).$returningId();
      return db.query.donations.findFirst({ where: eq(donations.id, id) });
    }),

  complete: publicQuery
    .input(
      z.object({
        id: z.number(),
        transactionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(donations).set({
        paymentStatus: "completed",
        transactionId: input.transactionId ?? null,
      }).where(eq(donations.id, input.id));
      return { success: true };
    }),

  listPublic: publicQuery.query(async () => {
    const db = getDb();
    return db.query.donations.findMany({
      where: eq(donations.paymentStatus, "completed"),
      orderBy: desc(donations.createdAt),
      limit: 50,
    });
  }),

  listAll: adminQuery.query(async () => {
    const db = getDb();
    return db.query.donations.findMany({
      orderBy: desc(donations.createdAt),
      limit: 200,
    });
  }),
});
