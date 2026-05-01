import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { userProfiles, forumPosts, forumComments, friends, users } from "@db/schema";
import { eq, desc, asc } from "drizzle-orm";

async function withUser(row: any) {
  if (!row) return null;
  const u = await getDb().select().from(users).where(eq(users.id, row.userId)).limit(1);
  return { ...row, user: u[0] ?? null };
}

export const socialRouter = createRouter({
  getProfile: publicQuery.input(z.object({ userId: z.number() })).query(async ({ input }) => {
    const r = await getDb().select().from(userProfiles).where(eq(userProfiles.userId, input.userId)).limit(1);
    return withUser(r[0]);
  }),
  getMyProfile: authedQuery.query(async ({ ctx }) => {
    const r = await getDb().select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
    return withUser(r[0]);
  }),
  createOrUpdateProfile: authedQuery.input(z.object({
    displayName: z.string().max(100).optional().or(z.literal("")),
    headline: z.string().max(255).optional().or(z.literal("")),
    aboutMe: z.string().optional().or(z.literal("")),
    interests: z.string().optional().or(z.literal("")),
    favoriteAnime: z.string().optional().or(z.literal("")),
    favoriteGames: z.string().optional().or(z.literal("")),
    profileSong: z.string().max(500).optional().or(z.literal("")),
    profileSongUrl: z.string().max(500).optional().or(z.literal("")),
    backgroundColor: z.string().max(20).optional().or(z.literal("")),
    backgroundImage: z.string().optional().or(z.literal("")),
    textColor: z.string().max(20).optional().or(z.literal("")),
    accentColor: z.string().max(20).optional().or(z.literal("")),
    mood: z.string().max(100).optional().or(z.literal("")),
    location: z.string().max(100).optional().or(z.literal("")),
    website: z.string().max(255).optional().or(z.literal("")),
    isPublic: z.boolean().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const data: any = {};
    for (const [k, v] of Object.entries(input)) if (v !== "" && v !== undefined) data[k] = v;
    const ex = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
    if (ex[0]) await db.update(userProfiles).set(data).where(eq(userProfiles.id, ex[0].id));
    else await db.insert(userProfiles).values({ userId: ctx.user.id, ...data });
    const r = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
    return withUser(r[0]);
  }),
  listPosts: publicQuery.input(z.object({ category: z.string().optional(), limit: z.number().default(20), offset: z.number().default(0) })).query(async ({ input }) => {
    const rows = await getDb().select().from(forumPosts).orderBy(desc(forumPosts.createdAt)).limit(input.limit).offset(input.offset);
    return Promise.all(rows.map(async p => ({ ...p, author: (await getDb().select().from(users).where(eq(users.id, p.authorId)).limit(1))[0] ?? null })));
  }),
  getPost: publicQuery.input(z.object({ postId: z.number() })).query(async ({ input }) => {
    const p = (await getDb().select().from(forumPosts).where(eq(forumPosts.id, input.postId)).limit(1))[0];
    if (!p) return null;
    const u = (await getDb().select().from(users).where(eq(users.id, p.authorId)).limit(1))[0] ?? null;
    const c = await getDb().select().from(forumComments).where(eq(forumComments.postId, input.postId)).orderBy(asc(forumComments.createdAt));
    const cc = await Promise.all(c.map(async x => ({ ...x, author: (await getDb().select().from(users).where(eq(users.id, x.authorId)).limit(1))[0] ?? null })));
    return { ...p, author: u, comments: cc };
  }),
  createPost: authedQuery.input(z.object({ title: z.string().min(1), content: z.string().min(1), category: z.string().default("general") })).mutation(async ({ ctx, input }) => {
    await getDb().insert(forumPosts).values({ authorId: ctx.user.id, ...input });
    return { success: true };
  }),
  createComment: authedQuery.input(z.object({ postId: z.number(), content: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    await getDb().insert(forumComments).values({ postId: input.postId, authorId: ctx.user.id, content: input.content });
    return { success: true };
  }),
  listFriends: authedQuery.query(async ({ ctx }) => {
    const rows = await getDb().select().from(friends).where(eq(friends.addresseeId, ctx.user.id));
    return Promise.all(rows.map(async f => ({ ...f, requester: (await getDb().select().from(users).where(eq(users.id, f.requesterId)).limit(1))[0] ?? null })));
  }),
  sendFriendRequest: authedQuery.input(z.object({ addresseeId: z.number() })).mutation(async ({ ctx, input }) => {
    await getDb().insert(friends).values({ requesterId: ctx.user.id, addresseeId: input.addresseeId });
    return { success: true };
  }),
});
