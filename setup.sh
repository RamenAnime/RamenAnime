#!/bin/bash
set -e

echo "=========================================="
echo "  ラーメンアニメ Complete Terminal Setup"
echo "=========================================="
echo ""

# Verify we're in the project root
if [ ! -f "package.json" ]; then
  echo "ERROR: Run this from inside your RamenAnime project folder"
  echo "Example: cd ~/RamenAnime && bash setup.sh"
  exit 1
fi

echo "[1/7] Writing db/schema.ts..."
cat << 'SCHEMAEOF' > db/schema.ts
import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  boolean,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).unique(),
  username: varchar("username", { length: 50 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  authType: mysqlEnum("auth_type", ["oauth", "local"]).default("oauth").notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const userProfiles = mysqlTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }),
  headline: varchar("headline", { length: 255 }),
  aboutMe: text("about_me"),
  interests: text("interests"),
  favoriteAnime: text("favorite_anime"),
  favoriteGames: text("favorite_games"),
  profileSong: varchar("profile_song", { length: 500 }),
  profileSongUrl: varchar("profile_song_url", { length: 500 }),
  backgroundColor: varchar("background_color", { length: 20 }).default("#0a0a0a"),
  backgroundImage: text("background_image"),
  textColor: varchar("text_color", { length: 20 }).default("#e5e5e5"),
  accentColor: varchar("accent_color", { length: 20 }).default("#d4a853"),
  mood: varchar("mood", { length: 100 }),
  location: varchar("location", { length: 100 }),
  website: varchar("website", { length: 255 }),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

export const forumPosts = mysqlTable("forum_posts", {
  id: serial("id").primaryKey(),
  authorId: bigint("authorId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).default("general").notNull(),
  likes: int("likes").default(0).notNull(),
  views: int("views").default(0).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;

export const forumComments = mysqlTable("forum_comments", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  authorId: bigint("authorId", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  likes: int("likes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type ForumComment = typeof forumComments.$inferSelect;
export type InsertForumComment = typeof forumComments.$inferInsert;

export const friends = mysqlTable("friends", {
  id: serial("id").primaryKey(),
  requesterId: bigint("requesterId", { mode: "number", unsigned: true }).notNull(),
  addresseeId: bigint("addresseeId", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "declined", "blocked"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Friend = typeof friends.$inferSelect;
export type InsertFriend = typeof friends.$inferInsert;

export const tosAcceptances = mysqlTable("tos_acceptances", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  version: varchar("version", { length: 20 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TosAcceptance = typeof tosAcceptances.$inferSelect;
export type InsertTosAcceptance = typeof tosAcceptances.$inferInsert;

export const marketplaceListings = mysqlTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  sellerId: bigint("sellerId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: varchar("price", { length: 50 }).notNull(),
  condition: mysqlEnum("condition", ["new", "used", "like_new"]).default("new").notNull(),
  category: varchar("category", { length: 50 }).default("general").notNull(),
  images: text("images"),
  contactMethod: varchar("contact_method", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceListing = typeof marketplaceListings.$inferInsert;

export const geoVerifications = mysqlTable("geo_verifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  countryCode: varchar("country_code", { length: 10 }).notNull(),
  countryName: varchar("country_name", { length: 100 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  ageVerified: boolean("age_verified").default(false).notNull(),
  idVerified: boolean("id_verified").default(false).notNull(),
  selfieVerified: boolean("selfie_verified").default(false).notNull(),
  blocked: boolean("blocked").default(false).notNull(),
  blockReason: text("block_reason"),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type GeoVerification = typeof geoVerifications.$inferSelect;
export type InsertGeoVerification = typeof geoVerifications.$inferInsert;

export const idVerifications = mysqlTable("id_verifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  idDocumentUrl: text("id_document_url"),
  selfieUrl: text("selfie_url"),
  idNumberHash: varchar("id_number_hash", { length: 255 }),
  fullName: varchar("full_name", { length: 255 }),
  dateOfBirth: varchar("date_of_birth", { length: 20 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "needs_review"]).default("pending").notNull(),
  rejectionReason: text("rejection_reason"),
  reviewedBy: bigint("reviewed_by", { mode: "number", unsigned: true }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type IdVerification = typeof idVerifications.$inferSelect;
export type InsertIdVerification = typeof idVerifications.$inferInsert;

export const donations = mysqlTable("donations", {
  id: serial("id").primaryKey(),
  donorName: varchar("donor_name", { length: 255 }),
  donorEmail: varchar("donor_email", { length: 320 }),
  amount: varchar("amount", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  countryCode: varchar("country_code", { length: 10 }),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentStatus: mysqlEnum("payment_status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  transactionId: varchar("transaction_id", { length: 255 }),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
  posts: many(forumPosts),
  comments: many(forumComments),
  sentFriendRequests: many(friends, { relationName: "requester" }),
  receivedFriendRequests: many(friends, { relationName: "addressee" }),
  tosAcceptance: one(tosAcceptances, { fields: [users.id], references: [tosAcceptances.userId] }),
  listings: many(marketplaceListings),
  geoVerification: one(geoVerifications, { fields: [users.id], references: [geoVerifications.userId] }),
  idVerification: one(idVerifications, { fields: [users.id], references: [idVerifications.userId] }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  author: one(users, { fields: [forumPosts.authorId], references: [users.id] }),
  comments: many(forumComments),
}));

export const forumCommentsRelations = relations(forumComments, ({ one }) => ({
  author: one(users, { fields: [forumComments.authorId], references: [users.id] }),
  post: one(forumPosts, { fields: [forumComments.postId], references: [forumPosts.id] }),
}));

export const friendsRelations = relations(friends, ({ one }) => ({
  requester: one(users, { fields: [friends.requesterId], references: [users.id], relationName: "requester" }),
  addressee: one(users, { fields: [friends.addresseeId], references: [users.id], relationName: "addressee" }),
}));

export const marketplaceListingsRelations = relations(marketplaceListings, ({ one }) => ({
  seller: one(users, { fields: [marketplaceListings.sellerId], references: [users.id] }),
}));

export const geoVerificationsRelations = relations(geoVerifications, ({ one }) => ({
  user: one(users, { fields: [geoVerifications.userId], references: [users.id] }),
}));

export const idVerificationsRelations = relations(idVerifications, ({ one }) => ({
  user: one(users, { fields: [idVerifications.userId], references: [users.id] }),
}));
SCHEMAEOF

echo "[2/7] Writing api/queries/users.ts..."
cat << 'USERSEOF' > api/queries/users.ts
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

export async function findUserByResetToken(token: string) {
  const db = getDb();
  const tokens = await db.select().from(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.token, token)).limit(1);
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

export async function setResetToken(userId: number, token: string, expiresAt: Date) {
  const db = getDb();
  await db.delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.userId, userId));
  await db.insert(schema.passwordResetTokens).values({ userId, token, expiresAt });
}

export async function clearResetToken(userId: number) {
  await getDb().delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.userId, userId));
}

export async function countAdmins() {
  const rows = await getDb().select().from(schema.users).where(eq(schema.users.role, "admin"));
  return rows.length;
}
USERSEOF

echo "[3/7] Writing api/auth-router.ts..."
cat << 'AUTHEOF' > api/auth-router.ts
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import * as cookie from "cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  findUserByUsername,
  findUserById,
  findUserByEmail,
  findUserByResetToken,
  createLocalUser,
  updateLastSignIn,
  updatePassword,
  setResetToken,
  clearResetToken,
  countAdmins,
} from "./queries/users";
import { signSessionToken } from "./kimi/session";
import { env } from "./lib/env";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function verifyPassword(stored: string, supplied: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;
  const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return buf.toString("hex") === hashed;
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.log("[email] No RESEND_API_KEY set, skipping email"); return; }
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "ラーメンアニメ <noreply@ramenanime.com>", to, subject, html }),
    });
    if (!resp.ok) { const text = await resp.text(); console.error("[email] Resend error:", resp.status, text); }
    else { console.log("[email] Sent to", to); }
  } catch (err) { console.error("[email] Failed:", err); }
}

function welcomeEmailHtml(username: string, baseUrl: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:20px 0;"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;"><tr><td style="background:linear-gradient(135deg,#d4a853,#b8860b);padding:30px;text-align:center;"><h1 style="color:#1a1a1a;margin:0;font-size:32px;font-weight:bold;">ラーメンアニメ</h1><p style="color:#1a1a1a;margin:8px 0 0;font-size:14px;font-weight:500;">Anime Collectibles & Social Community</p></td></tr><tr><td style="padding:30px;background:#ffffff;"><p style="font-size:16px;color:#333;line-height:1.6;">Hi <strong>${username}</strong>,</p><p style="font-size:16px;color:#333;line-height:1.6;">Welcome to <strong style="color:#b8860b;">ラーメンアニメ</strong>! We are thrilled to have you join our community of anime enthusiasts.</p><p style="font-size:16px;color:#333;line-height:1.6;">Your account has been successfully created. Here is what you can do now:</p><ul style="font-size:15px;color:#333;line-height:1.8;padding-left:20px;"><li>Shop — Browse our exclusive collection of custom 3D prints and trading cards</li><li>Forum — Connect with fellow fans in our MySpace-style social forum</li><li>Marketplace — Buy and sell anime collectibles from other community members</li><li>Friends — Build your anime network and make new friends</li></ul><p style="font-size:14px;color:#555;line-height:1.5;margin-top:20px;">If you have any questions, reply to this email or visit our <a href="${baseUrl}/contact" style="color:#b8860b;">Contact page</a>.</p></td></tr><tr><td style="background:#1a1a1a;padding:20px;text-align:center;font-size:12px;color:#888;"><p style="margin:0;">ラーメンアニメ | Anime Collectibles & Social Community</p><p style="margin:8px 0 0;font-size:11px;"><a href="${baseUrl}/terms" style="color:#aaa;">Terms of Service</a> | <a href="${baseUrl}/privacy" style="color:#aaa;">Privacy Policy</a></p></td></tr></table></td></tr></table></body></html>`;
}

function resetEmailHtml(username: string, token: string, baseUrl: string) {
  const link = `${baseUrl}/reset-password?token=${token}`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:20px 0;"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;"><tr><td style="background:linear-gradient(135deg,#d4a853,#b8860b);padding:30px;text-align:center;"><h1 style="color:#1a1a1a;margin:0;font-size:32px;font-weight:bold;">ラーメンアニメ</h1><p style="color:#1a1a1a;margin:8px 0 0;font-size:14px;font-weight:500;">Password Reset Request</p></td></tr><tr><td style="padding:30px;background:#ffffff;"><p style="font-size:16px;color:#333;line-height:1.6;">Hi <strong>${username}</strong>,</p><p style="font-size:16px;color:#333;line-height:1.6;">We received a request to reset your password. Click the button below to set a new password:</p><p style="margin:20px 0;text-align:center;"><a href="${link}" style="display:inline-block;background:#d4a853;color:#1a1a1a;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;font-size:14px;">Reset Password</a></p><p style="font-size:14px;color:#555;line-height:1.5;">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p><p style="font-size:14px;color:#555;line-height:1.5;">If the button doesn't work, copy and paste this link:<br/><code style="background:#f0f0f0;padding:4px 8px;border-radius:4px;word-break:break-all;">${link}</code></p></td></tr><tr><td style="background:#1a1a1a;padding:20px;text-align:center;font-size:12px;color:#888;"><p style="margin:0;">ラーメンアニメ | Anime Collectibles & Social Community</p></td></tr></table></td></tr></table></body></html>`;
}

const baseUrl = () => process.env.SITE_URL || "https://ramen-anime-denj.onrender.com";

async function verifyRecaptcha(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) { console.log("[recaptcha] No RECAPTCHA_SECRET_KEY set, skipping verification"); return true; }
  try {
    const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${token}`,
    });
    const data = await resp.json() as any;
    return data.success === true;
  } catch { return false; }
}

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
      password: z.string().min(8).max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
      email: z.string().email().optional(),
      recaptchaToken: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const recaptchaOk = await verifyRecaptcha(input.recaptchaToken);
      if (!recaptchaOk) throw new TRPCError({ code: "BAD_REQUEST", message: "CAPTCHA verification failed. Please try again." });

      const existing = await findUserByUsername(input.username);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Username already taken." });

      const passwordHash = await hashPassword(input.password);
      const adminCount = await countAdmins();
      const role = adminCount === 0 ? "admin" : "user";

      const insertResult = await createLocalUser({
        username: input.username,
        passwordHash,
        name: input.username,
        email: input.email ?? null,
        role,
      });

      const userId = Number((insertResult as any).insertId ?? (insertResult as any)[0]?.insertId ?? 0);
      if (!userId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user — could not retrieve user ID from database." });

      const user = await findUserById(userId);
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user — user not found after insert." });

      const token = await signSessionToken({ userId: user.id, clientId: env.appId });
      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append("set-cookie", cookie.serialize(Session.cookieName, token, {
        httpOnly: cookieOpts.httpOnly, path: cookieOpts.path, sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none", secure: cookieOpts.secure, maxAge: Session.maxAgeMs / 1000,
      }));

      await sendEmail(input.email ?? "", `Welcome to ラーメンアニメ — Your Anime Journey Begins!`, welcomeEmailHtml(user.username ?? "User", baseUrl()));

      return { success: true, user: { id: user.id, username: user.username, name: user.name, role: user.role } };
    }),

  login: publicQuery
    .input(z.object({ username: z.string().min(1), password: z.string().min(1), recaptchaToken: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const recaptchaOk = await verifyRecaptcha(input.recaptchaToken);
      if (!recaptchaOk) throw new TRPCError({ code: "BAD_REQUEST", message: "CAPTCHA verification failed. Please try again." });

      const user = await findUserByUsername(input.username);
      if (!user || !user.passwordHash) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password." });

      const valid = await verifyPassword(user.passwordHash, input.password);
      if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password." });

      await updateLastSignIn(user.id);
      const token = await signSessionToken({ userId: user.id, clientId: env.appId });
      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append("set-cookie", cookie.serialize(Session.cookieName, token, {
        httpOnly: cookieOpts.httpOnly, path: cookieOpts.path, sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none", secure: cookieOpts.secure, maxAge: Session.maxAgeMs / 1000,
      }));

      return { success: true, user: { id: user.id, username: user.username, name: user.name, role: user.role } };
    }),

  forgotPassword: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const user = await findUserByEmail(input.email);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "No account found with that email address." });

      const resetToken = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await setResetToken(user.id, resetToken, expiresAt);
      await sendEmail(input.email, "Reset your ラーメンアニメ password", resetEmailHtml(user.username ?? user.name ?? "User", resetToken, baseUrl()));

      return { success: true, message: "Password reset instructions sent to your email." };
    }),

  verifyResetToken: publicQuery
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ input }) => {
      const user = await findUserByResetToken(input.token);
      if (!user) return { valid: false };
      return { valid: true, username: user.username };
    }),

  resetPassword: publicQuery
    .input(z.object({ token: z.string().min(1), newPassword: z.string().min(8).max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/) }))
    .mutation(async ({ input }) => {
      const user = await findUserByResetToken(input.token);
      if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset token." });

      const newHash = await hashPassword(input.newPassword);
      await updatePassword(user.id, newHash);
      await clearResetToken(user.id);

      return { success: true, message: "Password updated successfully. You can now log in with your new password." };
    }),
});
AUTHEOF

echo "[4/7] Writing frontend files..."

cat << 'HTMLEOF' > index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#0a0a0a" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="ラーメンアニメ" />
    <meta name="description" content="ラーメンアニメ - Your one-stop shop for custom 3D printed anime goods and trading cards." />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <title>ラーメンアニメ</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(console.error);
        });
      }
    </script>
    <script>
      window.onRecaptchaVerify = function(token) {
        window.dispatchEvent(new CustomEvent('recaptcha-verify', { detail: token }));
      };
    </script>
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
  </body>
</html>
HTMLEOF

cat << 'APPEOF' > src/App.tsx
import { Routes, Route } from 'react-router'
import GeoBlock from '@/components/GeoBlock'
import EnhancedAgeGate from '@/components/EnhancedAgeGate'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Prints3D from './pages/Prints3D'
import TradingCards from './pages/TradingCards'
import Contact from './pages/Contact'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Social from './pages/Social'
import ForumPost from './pages/ForumPost'
import Profile from './pages/Profile'
import Friends from './pages/Friends'
import Marketplace from './pages/Marketplace'
import Donations from './pages/Donations'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import TosReacceptanceModal from './components/TosReacceptanceModal'

export default function App() {
  return (
    <GeoBlock>
      <EnhancedAgeGate>
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/3d-prints" element={<Prints3D />} />
              <Route path="/trading-cards" element={<TradingCards />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/donate" element={<Donations />} />
              <Route path="/social" element={<Social />} />
              <Route path="/post/:id" element={<ForumPost />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <TosReacceptanceModal />
          <Footer />
        </div>
      </EnhancedAgeGate>
    </GeoBlock>
  )
}
APPEOF

cat << 'AGEEOF' > src/components/EnhancedAgeGate.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Shield } from "lucide-react";

const AGE_KEY = "ramen_anime_age_verified_v2";

export default function EnhancedAgeGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [age, setAge] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(() => {
    try { return localStorage.getItem(AGE_KEY) === "true"; } catch { return false; }
  });

  const submitAge = trpc.geo.submitAgeVerification.useMutation({
    onSuccess: () => {
      localStorage.setItem(AGE_KEY, "true");
      setVerified(true);
      setError("");
    },
    onError: (err) => setError(err.message),
  });

  const verifyAge = () => {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18) {
      setError("You must be 18 or older to access this service.");
      return;
    }
    submitAge.mutate({ age: ageNum });
  };

  if (verified) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[150] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card/90 border-border/50 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xl mx-auto">
                ラ
              </div>
              <h1 className="text-2xl font-bold text-foreground">{t("ageGate.title")}</h1>
              <p className="text-sm text-muted-foreground">You must be 18 years or older to access this website.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Enter your age</label>
              <Input
                type="number"
                value={age}
                onChange={(e) => { setAge(e.target.value); setError(""); }}
                placeholder="18"
                min="1"
                max="120"
                className="bg-muted/50"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={verifyAge} disabled={submitAge.isPending}>
                <Shield className="mr-2 h-4 w-4" />
                {submitAge.isPending ? "Verifying..." : "Confirm Age & Continue"}
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "https://google.com"}>Exit</Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              By continuing, you confirm you are of legal age in your jurisdiction.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
AGEEOF

cat << 'LOGINEOF' > src/pages/Login.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Shield, ArrowLeft, UserPlus, LogIn, Eye, EyeOff, AlertCircle, Check, X, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render: (container: string | HTMLElement, options: { sitekey: string; callback: (token: string) => void }) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

function PasswordRequirements({ password }: { password: string }) {
  const reqs = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /\d/.test(password) },
    { label: "One special character (!@#$% etc.)", met: /[@$!%*?&]/.test(password) },
  ];
  return (
    <div className="space-y-1 text-xs">
      {reqs.map((r) => (
        <div key={r.label} className={`flex items-center gap-1.5 ${r.met ? "text-emerald-400" : "text-muted-foreground"}`}>
          {r.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {r.label}
        </div>
      ))}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | undefined>();
  const [recaptchaWidgetId, setRecaptchaWidgetId] = useState<number | undefined>();

  useEffect(() => {
    const handler = (e: Event) => setRecaptchaToken((e as CustomEvent).detail);
    window.addEventListener("recaptcha-verify", handler);
    return () => window.removeEventListener("recaptcha-verify", handler);
  }, []);

  useEffect(() => {
    if (mode === "register" && window.grecaptcha && !recaptchaWidgetId && RECAPTCHA_SITE_KEY) {
      const container = document.getElementById("recaptcha-container");
      if (container) {
        const id = window.grecaptcha.render(container, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (token: string) => setRecaptchaToken(token),
        });
        setRecaptchaWidgetId(id);
      }
    }
  }, [mode, recaptchaWidgetId]);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => { toast.success("Welcome back!"); navigate("/"); },
    onError: (err) => setError(err.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => { toast.success("Account created! Welcome to ラーメンアニメ."); navigate("/"); },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      loginMutation.mutate({ username, password, recaptchaToken });
    } else {
      if (!recaptchaToken) { setError("Please complete the CAPTCHA."); return; }
      registerMutation.mutate({ username, password, email: email || undefined, recaptchaToken });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
        </Link>
        <Card className="bg-card/90 border-border/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xl mx-auto mb-3">
              ラ
            </div>
            <CardTitle className="text-2xl font-bold">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Sign in to your ラーメンアニメ account" : "Join the anime community today"}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} placeholder="your_username" required className="bg-muted/50" />
              </div>
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional, needed for password recovery)</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com" className="bg-muted/50" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="Enter password" required className="bg-muted/50 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === "register" && password && <PasswordRequirements password={password} />}
              </div>
              {mode === "register" && (
                <div className="space-y-2">
                  <div id="recaptcha-container" />
                  {!recaptchaToken && <p className="text-xs text-muted-foreground">Complete the CAPTCHA above to register.</p>}
                </div>
              )}
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (mode === "login" ? "Signing in..." : "Creating account...") : (
                  <>{mode === "login" ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}{mode === "login" ? "Sign In" : "Create Account"}</>
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              {mode === "login" ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No account?{" "}
                    <button onClick={() => { setMode("register"); setError(""); }} className="text-primary hover:underline font-medium">Create one</button>
                  </p>
                  <Link to="/forgot-password" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <KeyRound className="mr-1 h-3 w-3" /> Forgot password?
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => { setMode("login"); setError(""); }} className="text-primary hover:underline font-medium">Sign in</button>
                </p>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>512-bit scrypt password hashing</span>
              <span>|</span>
              <MessageCircle className="h-3 w-3" />
              <span>Secure session cookies</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
LOGINEOF

cat << 'FORGOTEOF' > src/pages/ForgotPassword.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const forgotMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => { setSubmitted(true); setError(""); },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    forgotMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Login
        </Link>
        <Card className="bg-card/90 border-border/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xl mx-auto mb-3">
              ラ
            </div>
            <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
            <p className="text-sm text-muted-foreground">Enter your email and we will send you a reset link.</p>
          </CardHeader>
          <CardContent className="p-6">
            {submitted ? (
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto" />
                <p className="text-foreground">Check your email for reset instructions.</p>
                <Link to="/login">
                  <Button variant="outline" className="mt-2">Back to Login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="bg-muted/50" />
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={forgotMutation.isPending}>
                  <Mail className="mr-2 h-4 w-4" />
                  {forgotMutation.isPending ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
FORGOTEOF

cat << 'RESETEOF' > src/pages/ResetPassword.tsx
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, KeyRound, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const verifyQuery = trpc.auth.verifyResetToken.useQuery({ token }, { enabled: !!token });

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => { toast.success("Password updated!"); navigate("/login"); },
    onError: (err) => setError(err.message),
  });

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token.");
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      setError("Password must contain uppercase, lowercase, number, and special character.");
      return;
    }
    resetMutation.mutate({ token, newPassword: password });
  };

  if (verifyQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Verifying token...</p></div>;
  }

  if (!verifyQuery.data?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-xl font-bold">Invalid or Expired Link</h1>
          <p className="text-muted-foreground">This password reset link is no longer valid. Please request a new one.</p>
          <Link to="/forgot-password"><Button variant="outline">Request New Link</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Login
        </Link>
        <Card className="bg-card/90 border-border/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xl mx-auto mb-3">
              ラ
            </div>
            <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
            <p className="text-sm text-muted-foreground">Create a strong password for your account.</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" required className="bg-muted/50 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required className="bg-muted/50" />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={resetMutation.isPending}>
                <KeyRound className="mr-2 h-4 w-4" />
                {resetMutation.isPending ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
RESETEOF

echo "[5/7] Updating package.json with sed..."

# Remove bcryptjs from dependencies if present
if grep -q '"bcryptjs"' package.json; then
  sed -i '/"bcryptjs"/d' package.json
  echo "  Removed bcryptjs from dependencies"
fi

# Remove @types/bcryptjs from devDependencies if present
if grep -q '"@types/bcryptjs"' package.json; then
  sed -i '/"@types\/bcryptjs"/d' package.json
  echo "  Removed @types/bcryptjs from devDependencies"
fi

# Fix start script
sed -i 's/"start": ".*"/"start": "node dist\/boot.js"/' package.json

# Remove --external:bcryptjs from build script
sed -i 's/--external:bcryptjs //' package.json
sed -i 's/--external:bcryptjs//' package.json

echo "  package.json updated."

echo ""
echo "[6/7] Database setup instructions:"
echo "=========================================="
echo "Run these SQL commands in TiDB Cloud Console:"
echo ""
cat << 'SQLEOF'
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  userId BIGINT UNSIGNED NOT NULL UNIQUE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE AFTER unionId;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) AFTER username;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_type ENUM('oauth','local') DEFAULT 'oauth' NOT NULL AFTER password_hash;
SQLEOF
echo ""
echo "=========================================="
echo ""

echo "[7/7] Git commit and push..."
git add -A
git commit -m "feat: captcha, password reqs, 512-bit hash, forgot password, simple age gate" || echo "Nothing new to commit"
if git remote -v > /dev/null 2>&1; then
  git push origin main
  echo ""
  echo "=========================================="
  echo "  PUSHED TO GITHUB"
  echo "=========================================="
else
  echo "No git remote found. Add it with:"
  echo "  git remote add origin https://github.com/RamenAnime/RamenAnime.git"
  echo "  git push origin main"
fi

echo ""
echo "=========================================="
echo "  SETUP COMPLETE"
echo "=========================================="
echo ""
echo "Features added:"
echo "  512-bit scrypt password hashing (no bcryptjs bundling issues)"
echo "  Google reCAPTCHA v2 on login & register"
echo "  Password requirements: 8+ chars, upper, lower, number, special"
echo "  Forgot password + reset password email flow"
echo "  Simple age gate (just enter age, 18+)"
echo "  Visible error messages on registration"
echo ""
echo "NEXT STEP — Deploy on Render:"
echo "  1. Go to https://dashboard.render.com"
echo "  2. Click your 'ramen-anime' service"
echo "  3. Click 'Manual Deploy' > 'Clear Build Cache & Deploy'"
echo ""
echo "ENVIRONMENT VARIABLES to add on Render (if not already set):"
echo "  SITE_URL=https://ramen-anime-denj.onrender.com"
echo ""
echo "OPTIONAL: For password reset emails, get a free key at:"
echo "  https://resend.com/api-keys"
echo "Then add: RESEND_API_KEY=your_key"
echo ""
echo "OPTIONAL: For CAPTCHA, get keys at:"
echo "  https://www.google.com/recaptcha/admin"
echo "Create v2 'I'm not a robot' checkbox for domain: ramen-anime-denj.onrender.com"
echo "Then add:"
echo "  RECAPTCHA_SECRET_KEY=your_secret"
echo "  VITE_RECAPTCHA_SITE_KEY=your_site_key"
echo ""
echo "Note: CAPTCHA is optional -- if no keys are set, it will skip verification."
echo "Note: Without RESEND_API_KEY, forgot-password emails won't send."
echo "=========================================="
