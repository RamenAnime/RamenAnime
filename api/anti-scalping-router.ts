import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { prohibitedScans } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const antiScalpingRouter = createRouter({
  getUserScan: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const scans = await db.query.prohibitedScans.findMany({ where: eq(prohibitedScans.userId, ctx.user.id), orderBy: desc(prohibitedScans.createdAt) });
    return { scans, clean: scans.every(s => s.action === "clear") };
  }),
  getPending: adminQuery.query(async () => {
    const db = getDb();
    return db.query.prohibitedScans.findMany({ where: eq(prohibitedScans.action, "review"), orderBy: desc(prohibitedScans.createdAt) });
  }),
});
