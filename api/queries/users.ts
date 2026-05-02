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

export async function findUserByEmail(email: string) {
  if (!email) return undefined;
  const rows = await getDb().select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  return rows.at(0);
}

// Find user by SHA-256 hash of reset token
export async function findUserByResetTokenHash(hash: string) {
  const db = getDb();
  const tokens = await db.select().from(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.token, hash)).limit(1);
  const t = tokens.at(0);
  if (!t) return undefined;
  if (new Date() > new Date(t.expiresAt)) return undefined;
  return findUserById(t.userId);
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
  email?: string | null;
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

export async function updatePassword(userId: number, newHash: string) {
  await getDb().update(schema.users).set({ passwordHash: newHash }).where(eq(schema.users.id, userId));
}

// Store SHA-256 hash of reset token (not raw token)
export async function setResetTokenHash(userId: number, hash: string, expiresAt: Date) {
  const db = getDb();
  await db.delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.userId, userId));
  await db.insert(schema.passwordResetTokens).values({ userId, token: hash, expiresAt });
}

export async function clearResetToken(userId: number) {
  await getDb().delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.userId, userId));
}

export async function countAdmins() {
  const rows = await getDb().select().from(schema.users).where(eq(schema.users.role, "admin"));
  return rows.length;
}

export async function verifyUserEmail(userId: number) {
  await getDb().update(schema.users).set({ isEmailVerified: true }).where(eq(schema.users.id, userId));
}

export async function banUser(userId: number, banned: boolean) {
  await getDb().update(schema.users).set({ isBanned: banned }).where(eq(schema.users.id, userId));
}

export async function createNotification(data: {
  userId: number;
  type: string;
  title: string;
  message: string;
  link?: string;
}) {
  const db = getDb();
  await db.insert(schema.notifications).values({
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    link: data.link ?? null,
    isRead: false,
  });
}

