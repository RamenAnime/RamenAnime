import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { smsVerifications, users } from "@db/schema";
import { eq } from "drizzle-orm";

function generateCode(): string { return Math.floor(100000 + Math.random() * 900000).toString(); }

export const smsRouter = createRouter({
  requestCode: authedQuery.input(z.object({ phoneNumber: z.string().min(7).max(20), countryCode: z.string().default("+81") })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const code = generateCode();
    const existing = await db.query.smsVerifications.findFirst({ where: eq(smsVerifications.userId, ctx.user.id) });
    if (existing) {
      await db.update(smsVerifications).set({ phoneNumber: input.phoneNumber, countryCode: input.countryCode, codeHash: code, verified: false, attempts: 0, expiresAt: new Date(Date.now() + 10 * 60 * 1000), createdAt: new Date() }).where(eq(smsVerifications.id, existing.id));
    } else {
      await db.insert(smsVerifications).values({ userId: ctx.user.id, phoneNumber: input.phoneNumber, countryCode: input.countryCode, codeHash: code, verified: false, attempts: 0, expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
    }
    return { success: true, message: "Code sent (demo mode)", demoCode: code };
  }),
  verifyCode: authedQuery.input(z.object({ code: z.string().length(6) })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const record = await db.query.smsVerifications.findFirst({ where: eq(smsVerifications.userId, ctx.user.id) });
    if (!record) throw new Error("No verification requested");
    if (record.verified) return { success: true, alreadyVerified: true };
    if (record.expiresAt && new Date(record.expiresAt) < new Date()) throw new Error("Code expired");
    if (record.attempts >= 5) throw new Error("Too many attempts");
    await db.update(smsVerifications).set({ attempts: record.attempts + 1 }).where(eq(smsVerifications.id, record.id));
    if (record.codeHash !== input.code) throw new Error(`Invalid code. ${5 - record.attempts - 1} attempts remaining.`);
    await db.update(smsVerifications).set({ verified: true }).where(eq(smsVerifications.id, record.id));
    await db.update(users).set({ phoneVerified: true, phoneNumber: record.phoneNumber }).where(eq(users.id, ctx.user.id));
    return { success: true };
  }),
  getStatus: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const record = await db.query.smsVerifications.findFirst({ where: eq(smsVerifications.userId, ctx.user.id) });
    return { verified: record?.verified || false, phoneNumber: record?.phoneNumber || null, countryCode: record?.countryCode || null, attempts: record?.attempts || 0 };
  }),
});
