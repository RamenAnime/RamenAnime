import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { banUser } from "./queries/users";
import { users, userProfiles, forumPosts, forumComments, friends, marketplaceListings, donations, geoVerifications, tosAcceptances } from "@db/schema";
import { eq, desc, count } from "drizzle-orm";

export const adminRouter = createRouter({
  getStats: adminQuery.query(async () => {
    const db = getDb();
    const [userCount] = await db.select({ count: count() }).from(users);
    const [postCount] = await db.select({ count: count() }).from(forumPosts);
    const [commentCount] = await db.select({ count: count() }).from(forumComments);
    const [listingCount] = await db.select({ count: count() }).from(marketplaceListings);
    const [donationCount] = await db.select({ count: count() }).from(donations);
    const [friendCount] = await db.select({ count: count() }).from(friends);
    const [geoCount] = await db.select({ count: count() }).from(geoVerifications);
    const [tosCount] = await db.select({ count: count() }).from(tosAcceptances);
    const [profileCount] = await db.select({ count: count() }).from(userProfiles);
    const [adminCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "admin"));
    const [bannedCount] = await db.select({ count: count() }).from(users).where(eq(users.isBanned, true));
    return {
      users: userCount.count, admins: adminCount.count, banned: bannedCount.count, posts: postCount.count,
      comments: commentCount.count, listings: listingCount.count,
      donations: donationCount.count, friends: friendCount.count,
      geoVerifications: geoCount.count, tosAcceptances: tosCount.count,
      profiles: profileCount.count,
    };
  }),

  listUsers: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(users).orderBy(desc(users.createdAt));
  }),

  updateUserRole: adminQuery
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  banUser: adminQuery
    .input(z.object({ userId: z.number(), banned: z.boolean() }))
    .mutation(async ({ input }) => {
      await banUser(input.userId, input.banned);
      return { success: true, banned: input.banned };
    }),

  listPosts: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(forumPosts).orderBy(desc(forumPosts.createdAt));
    return Promise.all(rows.map(async (p) => {
      const u = await db.select().from(users).where(eq(users.id, p.authorId)).limit(1);
      return { ...p, authorName: u[0]?.name ?? "Unknown", authorId: u[0]?.id ?? 0 };
    }));
  }),

  deletePost: adminQuery
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(forumComments).where(eq(forumComments.postId, input.postId));
      await db.delete(forumPosts).where(eq(forumPosts.id, input.postId));
      return { success: true };
    }),

  listListings: adminQuery.query(async () => {
    const db = getDb();
    const rows = await db.select().from(marketplaceListings).orderBy(desc(marketplaceListings.createdAt));
    return Promise.all(rows.map(async (l) => {
      const u = await db.select().from(users).where(eq(users.id, l.sellerId)).limit(1);
      return { ...l, sellerName: u[0]?.name ?? "Unknown", sellerId: u[0]?.id ?? 0 };
    }));
  }),

  toggleListing: adminQuery
    .input(z.object({ listingId: z.number(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(marketplaceListings).set({ isActive: input.active }).where(eq(marketplaceListings.id, input.listingId));
      return { success: true };
    }),

  listDonations: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(donations).orderBy(desc(donations.createdAt));
  }),
});

