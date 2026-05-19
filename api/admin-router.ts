import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { banUser } from "./queries/users";
import { users, userProfiles, forumPosts, forumComments, friends, marketplaceListings, donations, geoVerifications, tosAcceptances, siteVisits, orders, copyrightScans } from "@db/schema";
import { eq, desc, count, sum, inArray } from "drizzle-orm";

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
    const [visitCount] = await db.select({ count: count() }).from(siteVisits);
    const [orderCount] = await db.select({ count: count() }).from(orders);
    const [paidOrderCount] = await db.select({ count: count() }).from(orders).where(eq(orders.status, "paid"));
    const [gmvRow] = await db.select({ total: sum(orders.totalAmount) }).from(orders).where(eq(orders.status, "paid"));
    const [donationTotal] = await db.select({ total: sum(donations.amount) }).from(donations).where(eq(donations.paymentStatus, "completed"));
    const [feeRow] = await db.select({ total: sum(orders.feeAmount) }).from(orders).where(eq(orders.status, "paid"));
    const [activeListingCount] = await db.select({ count: count() }).from(marketplaceListings).where(eq(marketplaceListings.isActive, true));
    return {
      users: userCount.count, admins: adminCount.count, banned: bannedCount.count, visits: visitCount.count, orders: orderCount.count, paidOrders: paidOrderCount.count, posts: postCount.count,
      comments: commentCount.count, listings: listingCount.count, activeListings: activeListingCount.count,
      donations: donationCount.count, friends: friendCount.count,
      geoVerifications: geoCount.count, tosAcceptances: tosCount.count,
      profiles: profileCount.count,
      gmv: gmvRow.total ?? "0",
      donationRevenue: donationTotal.total ?? "0",
      platformFees: feeRow.total ?? "0",
    };
  }),

  listUsers: adminQuery.query(async () => {
    const db = getDb();
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    const tosList = await db.select().from(tosAcceptances);
    return allUsers.map((u) => ({
      ...u,
      hasAcceptedTos: tosList.some((tos) => tos.userId === u.id),
    }));
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
    return Promise.all(rows.map(async (p: any) => {
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
    return Promise.all(rows.map(async (l: any) => {
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

  copyrightQueue: adminQuery.query(async () => {
    const db = getDb();
    const flagged = await db.query.marketplaceListings.findMany({
      where: inArray(marketplaceListings.copyrightStatus, ["flagged", "rejected", "pending"]),
      orderBy: desc(marketplaceListings.createdAt),
      limit: 100,
    });
    return Promise.all(
      flagged.map(async (l) => {
        const scans = await db.query.copyrightScans.findMany({
          where: eq(copyrightScans.listingId, l.id),
          orderBy: desc(copyrightScans.scannedAt),
        });
        const seller = await db.query.users.findFirst({
          where: eq(users.id, l.sellerId),
          columns: { id: true, name: true, email: true },
        });
        return { listing: l, scans, seller };
      })
    );
  }),

  reviewCopyright: adminQuery
    .input(
      z.object({
        listingId: z.number(),
        status: z.enum(["clear", "flagged", "rejected"]),
        note: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(marketplaceListings)
        .set({ copyrightStatus: input.status })
        .where(eq(marketplaceListings.id, input.listingId));
      await db.insert(copyrightScans).values({
        listingId: input.listingId,
        scanType: "text",
        status: input.status,
        confidence: "1.00",
        matchedTerms: JSON.stringify([]),
        reason: input.note || `Manual admin review: ${input.status}`,
      });
      return { success: true };
    }),
});

