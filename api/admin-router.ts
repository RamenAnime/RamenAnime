import { z } from "zod";
import { createRouter, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { users, userProfiles, forumPosts, forumComments, friends, marketplaceListings, donations, geoVerifications, tosAcceptances } from "@db/schema";
import { eq, desc, count } from "drizzle-orm";

export const adminRouter = createRouter({
  getStats: adminQuery.query(async () => {
    const db = getDb();
    const [uc] = await db.select({ c: count() }).from(users);
    const [pc] = await db.select({ c: count() }).from(forumPosts);
    const [cc] = await db.select({ c: count() }).from(forumComments);
    const [lc] = await db.select({ c: count() }).from(marketplaceListings);
    const [dc] = await db.select({ c: count() }).from(donations);
    const [ac] = await db.select({ c: count() }).from(users).where(eq(users.role, "admin"));
    const [prc] = await db.select({ c: count() }).from(userProfiles);
    return { users: uc.c, admins: ac.c, posts: pc.c, comments: cc.c, listings: lc.c, donations: dc.c, profiles: prc.c };
  }),
  listUsers: adminQuery.query(async () => getDb().select().from(users).orderBy(desc(users.createdAt))),
  updateUserRole: adminQuery.input(z.object({ userId: z.number(), role: z.enum(["user", "admin"]) })).mutation(async ({ input }) => {
    await getDb().update(users).set({ role: input.role }).where(eq(users.id, input.userId));
    return { success: true };
  }),
  listPosts: adminQuery.query(async () => {
    const rows = await getDb().select().from(forumPosts).orderBy(desc(forumPosts.createdAt));
    return Promise.all(rows.map(async p => ({ ...p, authorName: (await getDb().select().from(users).where(eq(users.id, p.authorId)).limit(1))[0]?.name ?? "Unknown" })));
  }),
  deletePost: adminQuery.input(z.object({ postId: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(forumComments).where(eq(forumComments.postId, input.postId));
    await db.delete(forumPosts).where(eq(forumPosts.id, input.postId));
    return { success: true };
  }),
  listListings: adminQuery.query(async () => {
    const rows = await getDb().select().from(marketplaceListings).orderBy(desc(marketplaceListings.createdAt));
    return Promise.all(rows.map(async l => ({ ...l, sellerName: (await getDb().select().from(users).where(eq(users.id, l.sellerId)).limit(1))[0]?.name ?? "Unknown" })));
  }),
  toggleListing: adminQuery.input(z.object({ listingId: z.number(), active: z.boolean() })).mutation(async ({ input }) => {
    await getDb().update(marketplaceListings).set({ isActive: input.active }).where(eq(marketplaceListings.id, input.listingId));
    return { success: true };
  }),
  listDonations: adminQuery.query(async () => getDb().select().from(donations).orderBy(desc(donations.createdAt))),
});
