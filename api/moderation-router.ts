import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { moderationLogs } from "@db/schema";
import { eq, desc, count } from "drizzle-orm";

export const moderationRouter = createRouter({
  listLogs: adminQuery
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      filter: z.enum(["all", "auto", "manual", "bans"]).default("all"),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const opts = input ?? { limit: 50, offset: 0, filter: "all" as const };
      const rows = await db.select().from(moderationLogs).orderBy(desc(moderationLogs.createdAt)).limit(opts.limit).offset(opts.offset);
      let filtered = rows;
      if (opts.filter === "auto") filtered = rows.filter((r) => r.autoModerated);
      if (opts.filter === "manual") filtered = rows.filter((r) => !r.autoModerated);
      if (opts.filter === "bans") filtered = rows.filter((r) => r.action === "ban");
      return filtered;
    }),

  stats: adminQuery.query(async () => {
      const db = getDb();
      const [totalLogs] = await db.select({ count: count() }).from(moderationLogs);
      const [autoLogs] = await db.select({ count: count() }).from(moderationLogs).where(eq(moderationLogs.autoModerated, true));
      const [manualLogs] = await db.select({ count: count() }).from(moderationLogs).where(eq(moderationLogs.autoModerated, false));
      const [banLogs] = await db.select({ count: count() }).from(moderationLogs).where(eq(moderationLogs.action, "ban"));
      const [removeLogs] = await db.select({ count: count() }).from(moderationLogs).where(eq(moderationLogs.action, "remove"));
      const [flagLogs] = await db.select({ count: count() }).from(moderationLogs).where(eq(moderationLogs.action, "flag"));
      const pendingReview = await db.select().from(moderationLogs);
      return {
        total: totalLogs.count, auto: autoLogs.count, manual: manualLogs.count,
        bans: banLogs.count, removals: removeLogs.count, flags: flagLogs.count,
        pendingReview: pendingReview.filter((r) => !r.reviewedBy).length,
      };
    }),

  review: adminQuery
    .input(z.object({ logId: z.number(), action: z.enum(["upheld", "overturned"]), note: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.update(moderationLogs).set({
        reviewedBy: ctx.user.id, reviewedAt: new Date(), reason: input.note ?? "Reviewed by admin",
      }).where(eq(moderationLogs.id, input.logId));
      return { success: true };
    }),

  updateWordList: adminQuery
    .input(z.object({ words: z.array(z.string()) }))
    .mutation(async ({ input }) => {
      return { success: true, words: input.words.length };
    }),
});
