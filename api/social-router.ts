import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { userProfiles, forumPosts, forumComments, friends } from "@db/schema";
import { eq, desc, asc } from "drizzle-orm";

export const socialRouter = createRouter({
  // ─── Profiles ───
  getProfile: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, input.userId),
        with: { user: true },
      });
      return profile ?? null;
    }),

  getMyProfile: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, ctx.user.id),
      with: { user: true },
    });
    return profile ?? null;
  }),

  createOrUpdateProfile: authedQuery
    .input(
      z.object({
        displayName: z.string().max(100).optional(),
        headline: z.string().max(255).optional(),
        aboutMe: z.string().optional(),
        interests: z.string().optional(),
        favoriteAnime: z.string().optional(),
        favoriteGames: z.string().optional(),
        profileSong: z.string().max(500).optional(),
        profileSongUrl: z.string().max(500).optional(),
        backgroundColor: z.string().max(20).optional(),
        backgroundImage: z.string().optional(),
        textColor: z.string().max(20).optional(),
        accentColor: z.string().max(20).optional(),
        mood: z.string().max(100).optional(),
        location: z.string().max(100).optional(),
        website: z.string().max(255).optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, ctx.user.id),
      });
      if (existing) {
        await db.update(userProfiles).set(input).where(eq(userProfiles.id, existing.id));
        return db.query.userProfiles.findFirst({
          where: eq(userProfiles.id, existing.id),
          with: { user: true },
        });
      } else {
        await db.insert(userProfiles).values({ userId: ctx.user.id, ...input });
        return db.query.userProfiles.findFirst({
          where: eq(userProfiles.userId, ctx.user.id),
          with: { user: true },
        });
      }
    }),

  listProfiles: publicQuery.query(async () => {
    const db = getDb();
    return db.query.userProfiles.findMany({
      where: eq(userProfiles.isPublic, true),
      with: { user: true },
      orderBy: desc(userProfiles.updatedAt),
    });
  }),

  // ─── Forum Posts ───
  listPosts: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const whereClause = input.category ? eq(forumPosts.category, input.category) : undefined;
      const posts = await db.query.forumPosts.findMany({
        where: whereClause,
        with: { author: true },
        orderBy: [desc(forumPosts.isPinned), desc(forumPosts.createdAt)],
        limit: input.limit,
        offset: input.offset,
      });
      return posts;
    }),

  getPost: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const post = await db.query.forumPosts.findFirst({
        where: eq(forumPosts.id, input.postId),
        with: { author: true, comments: { with: { author: true } } },
      });
      return post ?? null;
    }),

  createPost: authedQuery
    .input(z.object({ title: z.string().min(1).max(255), content: z.string().min(1), category: z.string().default("general") }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(forumPosts).values({ authorId: ctx.user.id, title: input.title, content: input.content, category: input.category });
      return { success: true };
    }),

  likePost: authedQuery
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(forumPosts).set({ likes: 1 }).where(eq(forumPosts.id, input.postId));
      return { success: true };
    }),

  // ─── Comments ───
  listComments: publicQuery
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db.query.forumComments.findMany({
        where: eq(forumComments.postId, input.postId),
        with: { author: true },
        orderBy: asc(forumComments.createdAt),
      });
    }),

  createComment: authedQuery
    .input(z.object({ postId: z.number(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(forumComments).values({ postId: input.postId, authorId: ctx.user.id, content: input.content });
      return { success: true };
    }),

  // ─── Friends ───
  listFriends: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.query.friends.findMany({
      where: eq(friends.addresseeId, ctx.user.id),
      with: { requester: true },
    });
    return rows;
  }),

  sendFriendRequest: authedQuery
    .input(z.object({ addresseeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.insert(friends).values({ requesterId: ctx.user.id, addresseeId: input.addresseeId });
      return { success: true };
    }),
});
