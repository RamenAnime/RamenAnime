import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { userProfiles, forumPosts, forumComments, friends } from "@db/schema";
import { eq, and, or, desc, asc } from "drizzle-orm";

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
        const [{ id }] = await db.insert(userProfiles).values({ userId: ctx.user.id, ...input }).$returningId();
        return db.query.userProfiles.findFirst({
          where: eq(userProfiles.id, id),
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
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const post = await db.query.forumPosts.findFirst({
        where: eq(forumPosts.id, input.id),
        with: { author: true, comments: { with: { author: true } } },
      });
      if (post) {
        await db.update(forumPosts).set({ views: post.views + 1 }).where(eq(forumPosts.id, input.id));
      }
      return post ?? null;
    }),

  createPost: authedQuery
    .input(
      z.object({
        title: z.string().min(1).max(255),
        content: z.string().min(1),
        category: z.string().max(50).default("general"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(forumPosts).values({
        authorId: ctx.user.id,
        ...input,
      }).$returningId();
      return db.query.forumPosts.findFirst({
        where: eq(forumPosts.id, id),
        with: { author: true },
      });
    }),

  likePost: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const post = await db.query.forumPosts.findFirst({ where: eq(forumPosts.id, input.id) });
      if (!post) throw new Error("Post not found");
      await db.update(forumPosts).set({ likes: post.likes + 1 }).where(eq(forumPosts.id, input.id));
      return { success: true };
    }),

  // ─── Forum Comments ───
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
    .input(
      z.object({
        postId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [{ id }] = await db.insert(forumComments).values({
        authorId: ctx.user.id,
        postId: input.postId,
        content: input.content,
      }).$returningId();
      return db.query.forumComments.findFirst({
        where: eq(forumComments.id, id),
        with: { author: true },
      });
    }),

  likeComment: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const comment = await db.query.forumComments.findFirst({ where: eq(forumComments.id, input.id) });
      if (!comment) throw new Error("Comment not found");
      await db.update(forumComments).set({ likes: comment.likes + 1 }).where(eq(forumComments.id, input.id));
      return { success: true };
    }),

  // ─── Friends ───
  listFriends: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const accepted = await db.query.friends.findMany({
      where: or(
        and(eq(friends.requesterId, ctx.user.id), eq(friends.status, "accepted")),
        and(eq(friends.addresseeId, ctx.user.id), eq(friends.status, "accepted"))
      ),
      with: { requester: true, addressee: true },
    });
    return accepted.map((f) => (f.requesterId === ctx.user.id ? f.addressee : f.requester));
  }),

  listFriendRequests: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.friends.findMany({
      where: and(eq(friends.addresseeId, ctx.user.id), eq(friends.status, "pending")),
      with: { requester: true },
    });
  }),

  sendFriendRequest: authedQuery
    .input(z.object({ addresseeId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      if (ctx.user.id === input.addresseeId) throw new Error("Cannot friend yourself");
      const existing = await db.query.friends.findFirst({
        where: or(
          and(eq(friends.requesterId, ctx.user.id), eq(friends.addresseeId, input.addresseeId)),
          and(eq(friends.requesterId, input.addresseeId), eq(friends.addresseeId, ctx.user.id))
        ),
      });
      if (existing) throw new Error("Friend request already exists");
      const [{ id }] = await db.insert(friends).values({
        requesterId: ctx.user.id,
        addresseeId: input.addresseeId,
        status: "pending",
      }).$returningId();
      return db.query.friends.findFirst({ where: eq(friends.id, id), with: { requester: true, addressee: true } });
    }),

  respondFriendRequest: authedQuery
    .input(z.object({ requestId: z.number(), accept: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const req = await db.query.friends.findFirst({
        where: and(eq(friends.id, input.requestId), eq(friends.addresseeId, ctx.user.id)),
      });
      if (!req) throw new Error("Request not found");
      await db.update(friends)
        .set({ status: input.accept ? "accepted" : "declined" })
        .where(eq(friends.id, input.requestId));
      return { success: true };
    }),

  removeFriend: authedQuery
    .input(z.object({ friendId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      await db.delete(friends).where(
        or(
          and(eq(friends.requesterId, ctx.user.id), eq(friends.addresseeId, input.friendId)),
          and(eq(friends.requesterId, input.friendId), eq(friends.addresseeId, ctx.user.id))
        )
      );
      return { success: true };
    }),
});
