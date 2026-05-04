import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { warehouseItems } from "@db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";

export const warehouseRouter = createRouter({
  getMyWarehouse: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const items = await db.query.warehouseItems.findMany({ where: eq(warehouseItems.userId, ctx.user.id), with: { order: { with: { listing: true } } }, orderBy: desc(warehouseItems.createdAt) });
    const groups = await db.select().from(warehouseItems).where(and(eq(warehouseItems.userId, ctx.user.id), eq(warehouseItems.status, "stored")));
    return { items, consolidationAvailable: groups.length >= 2, totalItems: items.length };
  }),
  requestConsolidation: authedQuery.input(z.object({ itemIds: z.array(z.number()).min(2).max(10) })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const items = await db.query.warehouseItems.findMany({ where: and(eq(warehouseItems.userId, ctx.user.id), inArray(warehouseItems.id, input.itemIds)) });
    if (items.length !== input.itemIds.length) throw new Error("Some items not found");
    const groupId = Date.now();
    for (const item of items) { await db.update(warehouseItems).set({ status: "consolidating", consolidationGroupId: groupId }).where(eq(warehouseItems.id, item.id)); }
    return { success: true, groupId, itemCount: items.length };
  }),
});
