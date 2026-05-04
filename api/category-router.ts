import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { categoryRules } from "@db/schema";
import { eq } from "drizzle-orm";

export const categoryRouter = createRouter({
  list: publicQuery.query(async () => { const db = getDb(); return db.query.categoryRules.findMany(); }),
  get: publicQuery.input(z.object({ category: z.string() })).query(async ({ input }) => { const db = getDb(); return db.query.categoryRules.findFirst({ where: eq(categoryRules.category, input.category) }); }),
  seedDefaults: adminQuery.mutation(async () => {
    const db = getDb();
    const defaults = [
      { category: "trading-cards", listingFee: "0", sellingFeePercent: "5", auctionFeePercent: "3", requiresDeposit: false, allowedTypes: "both" as const, taxCategory: "standard" },
      { category: "3d-prints", listingFee: "0", sellingFeePercent: "6", auctionFeePercent: "3", requiresDeposit: false, allowedTypes: "fixed" as const, taxCategory: "standard" },
      { category: "figures", listingFee: "0", sellingFeePercent: "5", auctionFeePercent: "2.5", requiresDeposit: false, allowedTypes: "both" as const, taxCategory: "standard" },
      { category: "apparel", listingFee: "0", sellingFeePercent: "8", auctionFeePercent: "4", requiresDeposit: false, allowedTypes: "fixed" as const, taxCategory: "apparel" },
      { category: "accessories", listingFee: "0", sellingFeePercent: "6", auctionFeePercent: "3", requiresDeposit: false, allowedTypes: "both" as const, taxCategory: "standard" },
      { category: "auction", listingFee: "0", sellingFeePercent: "4", auctionFeePercent: "2", requiresDeposit: true, minDepositAmount: "500", allowedTypes: "auction" as const, taxCategory: "standard" },
      { category: "general", listingFee: "0", sellingFeePercent: "5", auctionFeePercent: "3", requiresDeposit: false, allowedTypes: "both" as const, taxCategory: "standard" },
    ];
    for (const d of defaults) { const existing = await db.query.categoryRules.findFirst({ where: eq(categoryRules.category, d.category) }); if (!existing) await db.insert(categoryRules).values(d); }
    return { success: true };
  }),
});
