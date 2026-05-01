import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  users,
  userProfiles,
  forumPosts,
  forumComments,
  friends,
  marketplaceListings,
  donations,
  geoVerifications,
  tosAcceptances,
} from "@db/schema";
import { eq, desc, count, sql } from "drizzle-orm";

export const adminRouter = createRouter({
  // ─── Analytics ───
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

    const [adminCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "admin"));

    return {
      users: userCount.count,
      admins: adminCount.count,
      posts: postCount.count,
      comments: commentCount.count,
      listings: listingCount.count,
      donations: donationCount.count,
      friends: friendCount.count,
      geoVerifications: geoCount.count,
      tosAcceptances: tosCount.count,
      profiles: profileCount.count,
    };
  }),

  // ─── User Management ───
  listUsers: adminQuery.query(async () => {
    const db = getDb();
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return allUsers;
  }),

  getUserDetails: adminQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const user = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      const profile = await db.select().from(userProfiles).where(eq(userProfiles.userId, input.userId)).limit(1);
      const geo = await db.select().from(geoVerifications).where(eq(geoVerifications.userId, input.userId)).limit(1);
      return { user: user[0] ?? null, profile: profile[0] ?? null, geo: geo[0] ?? null };
    }),

  updateUserRole: adminQuery
    .input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),

  banUser: adminQuery
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(users).set({ role: "user" }).where(eq(users.id, input.userId));
      await db.delete(userProfiles).where(eq(userProfiles.userId, input.userId));
      return { success: true, message: "User has been restricted." };
    }),

  deleteUser: adminQuery
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(userProfiles).where(eq(userProfiles.userId, input.userId));
      await db.delete(geoVerifications).where(eq(geoVerifications.userId, input.userId));
      await db.delete(friends).where(eq(friends.requesterId, input.userId));
      await db.delete(friends).where(eq(friends.addresseeId, input.userId));
      await db.delete(users).where(eq(users.id, input.userId));
      return { success: true, message: "User deleted." };
    }),

  // ─── Forum Moderation ───
  listPosts: adminQuery.query(async () => {
    const db = getDb();
    const posts = await db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        content: forumPosts.content,
        category: forumPosts.category,
        likes: forumPosts.likes,
        views: forumPosts.views,
        isPinned: forumPosts.isPinned,
        createdAt: forumPosts.createdAt,
        authorName: users.name,
        authorId: users.id,
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.authorId, users.id))
      .orderBy(desc(forumPosts.createdAt));
    return posts;
  }),

  togglePinPost: adminQuery
    .input(z.object({ postId: z.number(), pinned: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(forumPosts).set({ isPinned: input.pinned }).where(eq(forumPosts.id, input.postId));
      return { success: true };
    }),

  deletePost: adminQuery
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(forumComments).where(eq(forumComments.postId, input.postId));
      await db.delete(forumPosts).where(eq(forumPosts.id, input.postId));
      return { success: true };
    }),

  // ─── Marketplace Moderation ───
  listListings: adminQuery.query(async () => {
    const db = getDb();
    const listings = await db
      .select({
        id: marketplaceListings.id,
        title: marketplaceListings.title,
        description: marketplaceListings.description,
        price: marketplaceListings.price,
        condition: marketplaceListings.condition,
        category: marketplaceListings.category,
        isActive: marketplaceListings.isActive,
        createdAt: marketplaceListings.createdAt,
        sellerName: users.name,
        sellerId: users.id,
      })
      .from(marketplaceListings)
      .leftJoin(users, eq(marketplaceListings.sellerId, users.id))
      .orderBy(desc(marketplaceListings.createdAt));
    return listings;
  }),

  toggleListing: adminQuery
    .input(z.object({ listingId: z.number(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(marketplaceListings).set({ isActive: input.active }).where(eq(marketplaceListings.id, input.listingId));
      return { success: true };
    }),

  // ─── Donations ───
  listDonations: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(donations).orderBy(desc(donations.createdAt));
  }),

  // ─── Geo Verifications ───
  listGeoVerifications: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(geoVerifications).orderBy(desc(geoVerifications.createdAt));
  }),
});
