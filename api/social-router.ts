import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { userProfiles, forumPosts, forumComments, friends, users } from "@db/schema";
import { eq, desc, asc } from "drizzle-orm";

export const socialRouter = createRouter({
  getProfile: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, input.userId)).limit(1);
      const p = profiles[0];
      if (!p) return null;
      const userRows = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      return { ...p, user: userRows[0] ?? null };
    }),

  getMyProfile: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
    const p = profiles[0];
    if (!p) return null;
    const userRows = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    return { ...p, user: userRows[0] ?? null };
  }),

  createOrUpdateProfile: authedQuery
    .input(
      z.object({
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
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const data: any = {};
      for (const [key, value] of Object.entries(input)) {
        if (value !== "" && value !== undefined) data[key] = value;
      }

      const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
      if (existing[0]) {
        await db.update(userProfiles).set(data).where(eq(userProfiles.id, existing[0].id));
      } else {
        await db.insert(userProfiles).values({ userId: ctx.user.id, ...data });
      }

      const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
      const p = profiles[0];
      if (!p) return null;
      const userRows = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      return { ...p, user: userRows[0] ?? null };
    }),

  listPosts: publicQuery
    .input(z.object({ category: z.string().optional(), limit: z.number().min(1).max(50).default(20), offset: z.number().min(0).default(0) }))
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db.select().from(forumPosts).orderBy(desc(forumPosts.createdAt)).limit(input.limit).offset(input.offset);
      return Promise.all(rows.map(async (p) => {
        const u = await db.select().from(users).where(eq(users.id, p.authorId)).limit(1);
        return { ...p, author: u[0] ?? null };
      }));
    }),

  getPost: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const posts = await db.select().from(forumPosts).where(eq(forumPosts.id, input.postId)).limit(1);
      const post = posts[0];
      if (!post) return null;
      const u = await db.select().from(users).where(eq(users.id, post.authorId)).limit(1);
      const comments = await db.select().from(forumComments).where(eq(forumComments.postId, input.postId)).orderBy(asc(forumComments.createdAt));
      const commentsWithAuthors = await Promise.all(comments.map(async (c) => {
        const cu = await db.select().from(users).where(eq(users.id, c.authorId)).limit(1);
        return { ...c, author: cu[0] ?? null };
      }));
      return { ...post, author: u[0] ?? null, comments: commentsWithAuthors };
    }),

  createPost: authedQuery
    .input(z.object({ title: z.string().min(1).max(255), content: z.string().min(1), category: z.string().default("general") }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(forumPosts).values({ authorId: ctx.user.id, title: input.title, content: input.content, category: input.category });
      return { success: true };
    }),

  createComment: authedQuery
    .input(z.object({ postId: z.number(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(forumComments).values({ postId: input.postId, authorId: ctx.user.id, content: input.content });
      return { success: true };
    }),

  listFriends: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.select().from(friends).where(eq(friends.addresseeId, ctx.user.id));
    return Promise.all(rows.map(async (f) => {
      const u = await db.select().from(users).where(eq(users.id, f.requesterId)).limit(1);
      return { ...f, requester: u[0] ?? null };
    }));
  }),

  sendFriendRequest: authedQuery
    .input(z.object({ addresseeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(friends).values({ requesterId: ctx.user.id, addresseeId: input.addresseeId });
      return { success: true };
    }),
});
