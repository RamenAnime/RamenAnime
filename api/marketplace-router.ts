import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { marketplaceListings } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";

export const marketplaceRouter = createRouter({
  listListings: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        condition: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(marketplaceListings.isActive, true)];
      if (input.category) conditions.push(eq(marketplaceListings.category, input.category));
      if (input.condition) conditions.push(eq(marketplaceListings.condition, input.condition as "new" | "used" | "like_new"));
      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];
      return db.query.marketplaceListings.findMany({
        where: whereClause,
        with: { seller: true },
        orderBy: desc(marketplaceListings.createdAt),
        limit: input.limit,
        offset: input.offset,
      });
    }),

  getListing: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.marketplaceListings.findFirst({
        where: eq(marketplaceListings.id, input.id),
        with: { seller: true },
      }) ?? null;
    }),

  createListing: authedQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().min(1),
        price: z.string().min(1).max(50),
        condition: z.enum(["new", "used", "like_new"]).default("new"),
        category: z.string().max(50).default("general"),
        images: z.string().optional(),
        contactMethod: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(marketplaceListings).values({
        sellerId: ctx.user.id,
        ...input,
      }).$returningId();
      return db.query.marketplaceListings.findFirst({
        where: eq(marketplaceListings.id, id),
        with: { seller: true },
      });
    }),

  deleteListing: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const listing = await db.query.marketplaceListings.findFirst({
        where: eq(marketplaceListings.id, input.id),
      });
      if (!listing || listing.sellerId !== ctx.user.id) throw new Error("Unauthorized");
      await db.delete(marketplaceListings).where(eq(marketplaceListings.id, input.id));
      return { success: true };
    }),

  myListings: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.marketplaceListings.findMany({
      where: eq(marketplaceListings.sellerId, ctx.user.id),
      with: { seller: true },
      orderBy: desc(marketplaceListings.createdAt),
    });
  }),
});
