import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tosAcceptances } from "@db/schema";
import { eq } from "drizzle-orm";

export const TOS_VERSION = "1.0.0";

export const tosRouter = createRouter({
  getStatus: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const acceptance = await db.query.tosAcceptances.findFirst({
      where: eq(tosAcceptances.userId, ctx.user.id),
    });
    return {
      accepted: !!acceptance,
      version: acceptance?.version ?? null,
      requiredVersion: TOS_VERSION,
      needsAcceptance: !acceptance || acceptance.version !== TOS_VERSION,
    };
  }),

  accept: authedQuery
    .input(
      z.object({
        accepted: z.literal(true),
        ipAddress: z.string().max(45).optional(),
        userAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.tosAcceptances.findFirst({
        where: eq(tosAcceptances.userId, ctx.user.id),
      });
      if (existing) {
        await db
          .update(tosAcceptances)
          .set({
            version: TOS_VERSION,
            ipAddress: input.ipAddress ?? null,
            userAgent: input.userAgent ?? null,
          })
          .where(eq(tosAcceptances.id, existing.id));
      } else {
        await db.insert(tosAcceptances).values({
          userId: ctx.user.id,
          version: TOS_VERSION,
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        });
      }
      return { success: true, version: TOS_VERSION };
    }),
});
