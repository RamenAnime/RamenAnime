import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { siteVisits } from "@db/schema";
import { count } from "drizzle-orm";

function hashIp(ip: string): string {
  // Simple hash - in production use a proper crypto hash
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}

export const visitRouter = createRouter({
  track: publicQuery
    .input(
      z.object({
        path: z.string().max(255).default("/"),
        referrer: z.string().max(500).optional(),
        country: z.string().max(10).optional(),
      }).optional()
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const ip = ctx.req.headers.get("x-forwarded-for")
        || ctx.req.headers.get("x-real-ip")
        || "unknown";
      const userAgent = ctx.req.headers.get("user-agent") || "";

      await db.insert(siteVisits).values({
        ipHash: hashIp(ip),
        userAgent: userAgent.slice(0, 255),
        path: input?.path ?? "/",
        referrer: input?.referrer?.slice(0, 500) ?? null,
        country: input?.country?.toUpperCase().slice(0, 10) ?? null,
      });

      return { success: true };
    }),

  count: publicQuery.query(async () => {
    const db = getDb();
    const [result] = await db.select({ count: count() }).from(siteVisits);
    return { visits: result.count };
  }),
});
