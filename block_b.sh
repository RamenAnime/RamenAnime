#!/bin/bash
echo "[Block B] Writing users queries + auth router + geo router..."

if [ ! -f "package.json" ]; then
  echo "ERROR: Run this from inside your RamenAnime project folder"
  exit 1
fi

cat << 'EOF' > api/queries/users.ts
import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

export async function findUserById(id: number) {
  const rows = await getDb().select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  return rows.at(0);
}

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb().select().from(schema.users).where(eq(schema.users.unionId, unionId)).limit(1);
  return rows.at(0);
}

export async function findUserByUsername(username: string) {
  const rows = await getDb().select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser) {
  const values = { ...data };
  const updateSet: Partial<InsertUser> = { lastSignInAt: new Date(), ...data };
  if (values.role === undefined && values.unionId && values.unionId === env.ownerUnionId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await getDb().insert(schema.users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function createLocalUser(data: {
  username: string;
  passwordHash: string;
  name?: string;
  email?: string;
  role?: "user" | "admin";
}) {
  const db = getDb();
  const result = await db.insert(schema.users).values({
    username: data.username,
    passwordHash: data.passwordHash,
    name: data.name ?? data.username,
    email: data.email,
    authType: "local",
    role: data.role ?? "user",
    lastSignInAt: new Date(),
  });
  return result;
}

export async function updateLastSignIn(userId: number) {
  await getDb().update(schema.users).set({ lastSignInAt: new Date() }).where(eq(schema.users.id, userId));
}

export async function countAdmins() {
  const rows = await getDb().select().from(schema.users).where(eq(schema.users.role, "admin"));
  return rows.length;
}
EOF

cat << 'EOF' > api/auth-router.ts
import * as cookie from "cookie";
import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { findUserByUsername, findUserById, createLocalUser, updateLastSignIn, countAdmins } from "./queries/users";
import { signSessionToken } from "./kimi/session";
import { env } from "./lib/env";

export const authRouter = createRouter({
  me: authedQuery.query((opts) => {
    const { passwordHash: _ph, ...safeUser } = opts.ctx.user;
    return safeUser;
  }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append("set-cookie", cookie.serialize(Session.cookieName, "", {
      httpOnly: opts.httpOnly, path: opts.path, sameSite: opts.sameSite?.toLowerCase() as "lax" | "none", secure: opts.secure, maxAge: 0,
    }));
    return { success: true };
  }),

  register: publicQuery
    .input(z.object({
      username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
      password: z.string().min(6).max(100),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await findUserByUsername(input.username);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Username already taken." });
      const passwordHash = await bcrypt.hash(input.password, 12);
      const adminCount = await countAdmins();
      const role = adminCount === 0 ? "admin" : "user";
      const insertResult = await createLocalUser({ username: input.username, passwordHash, name: input.username, email: input.email, role });
      const userId = Number((insertResult as any).insertId);
      const user = await findUserById(userId);
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user." });
      const token = await signSessionToken({ userId: user.id, clientId: env.appId });
      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append("set-cookie", cookie.serialize(Session.cookieName, token, {
        httpOnly: cookieOpts.httpOnly, path: cookieOpts.path, sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none", secure: cookieOpts.secure, maxAge: Session.maxAgeMs / 1000,
      }));
      return { success: true, user: { id: user.id, username: user.username, name: user.name, role: user.role } };
    }),

  login: publicQuery
    .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const user = await findUserByUsername(input.username);
      if (!user || !user.passwordHash) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password." });
      const valid = await bcrypt.compare(input.password, user.passwordHash);
      if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password." });
      await updateLastSignIn(user.id);
      const token = await signSessionToken({ userId: user.id, clientId: env.appId });
      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append("set-cookie", cookie.serialize(Session.cookieName, token, {
        httpOnly: cookieOpts.httpOnly, path: cookieOpts.path, sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none", secure: cookieOpts.secure, maxAge: Session.maxAgeMs / 1000,
      }));
      return { success: true, user: { id: user.id, username: user.username, name: user.name, role: user.role } };
    }),
});
EOF

cat << 'EOF' > api/geo-router.ts
import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { geoVerifications, idVerifications } from "@db/schema";
import { eq } from "drizzle-orm";

const ALLOWED_COUNTRIES = ["US", "CA", "JP", "KR", "CN", "FR"];

export const geoRouter = createRouter({
  checkAccess: publicQuery
    .input(z.object({ countryCode: z.string() }))
    .query(async ({ input }) => {
      const allowed = ALLOWED_COUNTRIES.includes(input.countryCode.toUpperCase());
      return { allowed, countryCode: input.countryCode.toUpperCase(), message: allowed ? "Access granted" : "This service is not available in your country. We only operate in the United States, Canada, Japan, South Korea, China, and France." };
    }),

  getMyGeoStatus: publicQuery.query(async ({ ctx }) => {
    const db = getDb();
    if (!ctx.user) return null;
    const record = await db.query.geoVerifications.findFirst({ where: eq(geoVerifications.userId, ctx.user.id) });
    return record ?? null;
  }),

  registerGeo: publicQuery
    .input(z.object({ countryCode: z.string().min(2).max(10), countryName: z.string().min(1).max(100), ipAddress: z.string().optional() }))
    .mutation(async ({ input }) => {
      const allowed = ALLOWED_COUNTRIES.includes(input.countryCode.toUpperCase());
      return { allowed, message: allowed ? "Country verified" : "Country not allowed" };
    }),

  getAgeStatus: publicQuery.query(async () => {
    return { ageVerified: false, idVerified: false, selfieVerified: false, allVerified: false };
  }),

  submitAgeVerification: publicQuery
    .input(z.object({ age: z.number().min(18).max(120), ipAddress: z.string().optional() }))
    .mutation(async ({ input }) => {
      return { success: true, age: input.age };
    }),

  submitIdVerification: publicQuery
    .input(z.object({ idDocumentUrl: z.string().url(), selfieUrl: z.string().url(), idNumberHash: z.string().optional(), fullName: z.string().optional(), dateOfBirth: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(idVerifications).values({ userId: 0, ...input, status: "pending" }).$returningId();
      return { success: true, status: "pending", id };
    }),

  listPendingVerifications: adminQuery.query(async () => {
    const db = getDb();
    return db.query.idVerifications.findMany({ where: eq(idVerifications.status, "pending"), with: { user: true } });
  }),

  reviewVerification: adminQuery
    .input(z.object({ id: z.number(), status: z.enum(["approved", "rejected"]), rejectionReason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const record = await db.query.idVerifications.findFirst({ where: eq(idVerifications.id, input.id) });
      if (!record) throw new Error("Not found");
      await db.update(idVerifications).set({ status: input.status, rejectionReason: input.rejectionReason ?? null, reviewedBy: ctx.user.id, reviewedAt: new Date(), updatedAt: new Date() }).where(eq(idVerifications.id, input.id));
      return { success: true };
    }),
});
EOF

echo "Block B complete."
