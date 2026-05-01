#!/bin/bash
echo "[Block A] Writing schema + auth types + session + auth handler..."

if [ ! -f "package.json" ]; then
  echo "ERROR: Run this from inside your RamenAnime project folder"
  exit 1
fi

mkdir -p db api/kimi api/queries

cat << 'EOF' > db/schema.ts
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
  reviewer: one(users, { fields: [idVerifications.reviewedBy], references: [users.id] }),
}));
EOF

cat << 'EOF' > api/kimi/types.ts
export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

export type SessionPayload = {
  unionId?: string;
  userId?: number;
  clientId: string;
};

export type UserProfile = {
  user_id: string;
  name: string;
  avatar_url: string;
};
EOF

cat << 'EOF' > api/kimi/session.ts
import * as jose from "jose";
import { env } from "../lib/env";
import type { SessionPayload } from "./types";

const JWT_ALG = "HS256";

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime("1 year")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token) {
    console.warn("[session] No token provided for verification.");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, { algorithms: [JWT_ALG] });
    const { unionId, userId, clientId } = payload;
    if ((!unionId && !userId) || !clientId) {
      console.warn("[session] JWT payload missing required fields.");
      return null;
    }
    return { unionId, userId, clientId } as SessionPayload;
  } catch (error) {
    console.warn("[session] JWT verification failed:", error);
    return null;
  }
}
EOF

cat << 'EOF' > api/kimi/auth.ts
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as jose from "jose";
import * as cookie from "cookie";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { signSessionToken, verifySessionToken } from "./session";
import { users as kimiUsers } from "./platform";
import { findUserByUnionId, findUserById, upsertUser } from "../queries/users";
import type { TokenResponse } from "./types";

async function exchangeAuthCode(code: string, redirectUri: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.appId,
    redirect_uri: redirectUri,
    client_secret: env.appSecret,
  });
  const resp = await fetch(`${env.kimiAuthUrl}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token exchange failed (${resp.status}): ${text}`);
  }
  return resp.json() as Promise<TokenResponse>;
}

const jwks = jose.createRemoteJWKSet(new URL(`${env.kimiAuthUrl}/api/.well-known/jwks.json`));

async function verifyAccessToken(accessToken: string): Promise<{ userId: string; clientId: string }> {
  const { payload } = await jose.jwtVerify(accessToken, jwks);
  const userId = payload.user_id as string;
  const clientId = payload.client_id as string;
  if (!userId) throw new Error("user_id missing from access token");
  return { userId, clientId };
}

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie found.");
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) throw Errors.forbidden("Invalid authentication token.");
  if (claim.unionId) {
    const user = await findUserByUnionId(claim.unionId);
    if (!user) throw Errors.forbidden("User not found. Please re-login.");
    return user;
  }
  if (claim.userId) {
    const user = await findUserById(claim.userId);
    if (!user) throw Errors.forbidden("User not found. Please re-login.");
    return user;
  }
  throw Errors.forbidden("Invalid session token.");
}

export function createOAuthCallbackHandler() {
  return async (c: Context) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");
    const errorDescription = c.req.query("error_description");
    if (error) {
      if (error === "access_denied") return c.redirect("/", 302);
      return c.json({ error, error_description: errorDescription }, 400);
    }
    if (!code || !state) return c.json({ error: "code and state are required" }, 400);
    try {
      const redirectUri = atob(state);
      const tokenResp = await exchangeAuthCode(code, redirectUri);
      const { userId } = await verifyAccessToken(tokenResp.access_token);
      const userProfile = await kimiUsers.getProfile(tokenResp.access_token);
      if (!userProfile) throw new Error("Failed to fetch user profile from Kimi Open");
      await upsertUser({ unionId: userId, name: userProfile.name, avatar: userProfile.avatar_url, lastSignInAt: new Date() });
      const token = await signSessionToken({ unionId: userId, clientId: env.appId });
      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, { ...cookieOpts, maxAge: Session.maxAgeMs / 1000 });
      return c.redirect("/", 302);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      return c.json({ error: "OAuth callback failed" }, 500);
    }
  };
}

export { exchangeAuthCode, verifyAccessToken };
EOF

echo "Block A complete."
