import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { userProfiles, forumPosts, forumComments, forumReactions, userSignatures, friends, users } from "@db/schema";
import { eq, desc, asc, sql, count, and, gte } from "drizzle-orm";
import { createNotification } from "./queries/users";
import { moderateContent } from "./lib/moderator";

const RANKS = [
  { min: 0, name: "Newbie", color: "gray" },
  { min: 5, name: "Member", color: "blue" },
  { min: 25, name: "Regular", color: "green" },
  { min: 100, name: "Enthusiast", color: "purple" },
  { min: 500, name: "Veteran", color: "orange" },
  { min: 1000, name: "Legend", color: "amber" },
  { min: 5000, name: "Otaku God", color: "red" },
];

function getUserRank(postCount: number) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (postCount >= RANKS[i].min) return RANKS[i];
  }
  return RANKS[0];
}

async function attachUser<T extends { userId: number }>(row: T | undefined) {
  if (!row) return null;
  const db = getDb();
  const u = await db.select().from(users).where(eq(users.id, row.userId)).limit(1);
  return { ...row, user: u[0] ?? null };
}

async function getUserPostCount(userId: number): Promise<number> {
  const db = getDb();
  const postCount = await db.select({ count: count() }).from(forumPosts).where(eq(forumPosts.authorId, userId));
  const commentCount = await db.select({ count: count() }).from(forumComments).where(eq(forumComments.authorId, userId));
  return (postCount[0]?.count || 0) + (commentCount[0]?.count || 0);
}

async function getUserSignature(userId: number) {
  const db = getDb();
  const sigs = await db.select().from(userSignatures).where(eq(userSignatures.userId, userId)).limit(1);
  return sigs[0] ?? null;
}

async function enrichUser(user: any) {
  if (!user) return user;
  const postCount = await getUserPostCount(user.id);
  const signature = await getUserSignature(user.id);
  return { ...user, rank: getUserRank(postCount), postCount, signature: signature?.content ?? null };
}

export const socialRouter = createRouter({
  getProfile: publicQuery.input(z.object({ userId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const rows = await db.select().from(userProfiles).where(eq(userProfiles.userId, input.userId)).limit(1);
    return attachUser(rows[0]);
  }),

  getMyProfile: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
    return attachUser(rows[0]);
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
    const data: Record<string, any> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value !== "" && value !== undefined) data[key] = value;
    }
    const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
    if (existing[0]) {
      await db.update(userProfiles).set(data).where(eq(userProfiles.id, existing[0].id));
    } else {
      await db.insert(userProfiles).values({ userId: ctx.user.id, ...data });
    }
    const rows = await db.select().from(userProfiles).where(eq(userProfiles.userId, ctx.user.id)).limit(1);
    return attachUser(rows[0]);
  }),

  getMySignature: authedQuery.query(async ({ ctx }) => {
    const sig = await getUserSignature(ctx.user.id);
    return sig ?? { content: "", isVisible: true };
  }),

  updateSignature: authedQuery.input(z.object({ content: z.string().max(500), isVisible: z.boolean().default(true) })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const existing = await db.select().from(userSignatures).where(eq(userSignatures.userId, ctx.user.id)).limit(1);
    if (existing[0]) {
      await db.update(userSignatures).set(input).where(eq(userSignatures.id, existing[0].id));
    } else {
      await db.insert(userSignatures).values({ userId: ctx.user.id, ...input });
    }
    return { success: true };
  }),

  listPosts: publicQuery.input(z.object({
    category: z.string().optional(),
    limit: z.number().min(1).max(50).default(20),
    offset: z.number().min(0).default(0),
    sort: z.enum(["latest", "popular", "pinned"]).default("latest")
  })).query(async ({ input }) => {
    const db = getDb();
    let orderBy;
    if (input.sort === "popular") orderBy = desc(forumPosts.likes);
    else if (input.sort === "pinned") orderBy = desc(forumPosts.isPinned);
    else orderBy = desc(forumPosts.createdAt);

    const rows = await db.select().from(forumPosts)
      .where(input.category ? eq(forumPosts.category, input.category) : undefined)
      .orderBy(desc(forumPosts.isPinned), orderBy)
      .limit(input.limit).offset(input.offset);

    return Promise.all(rows.map(async (p) => {
      const u = await db.select().from(users).where(eq(users.id, p.authorId)).limit(1);
      const enriched = await enrichUser(u[0]);
      const commentCount = await db.select({ count: count() }).from(forumComments).where(eq(forumComments.postId, p.id));
      const reactionCounts = await db.select({ emoji: forumReactions.emoji, count: count() })
        .from(forumReactions).where(eq(forumReactions.postId, p.id)).groupBy(forumReactions.emoji);
      return { ...p, author: enriched, commentCount: commentCount[0]?.count || 0, reactionCounts };
    }));
  }),

  getPost: publicQuery.input(z.object({ postId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const posts = await db.select().from(forumPosts).where(eq(forumPosts.id, input.postId)).limit(1);
    const post = posts[0];
    if (!post) return null;
    const u = await db.select().from(users).where(eq(users.id, post.authorId)).limit(1);
    const enriched = await enrichUser(u[0]);
    const comments = await db.select().from(forumComments).where(eq(forumComments.postId, input.postId)).orderBy(asc(forumComments.createdAt));
    const commentsWithAuthors = await Promise.all(comments.map(async (c) => {
      const cu = await db.select().from(users).where(eq(users.id, c.authorId)).limit(1);
      return { ...c, author: await enrichUser(cu[0]) };
    }));
    const reactionCounts = await db.select({ emoji: forumReactions.emoji, count: count() })
      .from(forumReactions).where(eq(forumReactions.postId, post.id)).groupBy(forumReactions.emoji);
    return { ...post, author: enriched, comments: commentsWithAuthors, reactionCounts };
  }),

  createPost: authedQuery.input(z.object({
    title: z.string().min(1).max(255), content: z.string().min(1), category: z.string().default("general")
  })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const combined = `${input.title} ${input.content}`;
    const modResult = await moderateContent(ctx.user.id, "post", 0, combined, ctx.user.username ?? undefined);
    if (modResult.action === "ban") throw new Error("Your account has been suspended due to repeated TOS violations.");
    if (modResult.action === "remove") throw new Error(`Your post was blocked: ${modResult.reason}`);
    await db.insert(forumPosts).values({ authorId: ctx.user.id, title: input.title, content: input.content, category: input.category });
    return { success: true, flagged: modResult.action === "flag", flagReason: modResult.action === "flag" ? modResult.reason : undefined };
  }),

  createComment: authedQuery.input(z.object({
    postId: z.number(), content: z.string().min(1), parentId: z.number().optional()
  })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const posts = await db.select().from(forumPosts).where(eq(forumPosts.id, input.postId)).limit(1);
    const post = posts[0];
    if (post?.isLocked) throw new Error("This thread is locked and cannot be replied to.");
    const modResult = await moderateContent(ctx.user.id, "comment", 0, input.content, ctx.user.username ?? undefined);
    if (modResult.action === "ban") throw new Error("Your account has been suspended due to repeated TOS violations.");
    if (modResult.action === "remove") throw new Error(`Your comment was blocked: ${modResult.reason}`);
    await db.insert(forumComments).values({ postId: input.postId, authorId: ctx.user.id, content: input.content, parentId: input.parentId });
    if (post && post.authorId !== ctx.user.id) {
      await createNotification({ userId: post.authorId, type: "comment", title: "New comment on your post", message: `${ctx.user.name ?? ctx.user.username} commented on "${post.title}"`, link: `/post/${input.postId}` });
    }
    return { success: true, flagged: modResult.action === "flag", flagReason: modResult.action === "flag" ? modResult.reason : undefined };
  }),

  likePost: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const posts = await db.select().from(forumPosts).where(eq(forumPosts.id, input.id)).limit(1);
    if (posts[0]) await db.update(forumPosts).set({ likes: posts[0].likes + 1 }).where(eq(forumPosts.id, input.id));
n    return { success: true };
  }),

  likeComment: authedQuery.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const comments = await db.select().from(forumComments).where(eq(forumComments.id, input.id)).limit(1);
    if (comments[0]) await db.update(forumComments).set({ likes: comments[0].likes + 1 }).where(eq(forumComments.id, input.id));
    return { success: true };
  }),

  reactToPost: authedQuery.input(z.object({ postId: z.number(), emoji: z.string().min(1).max(20) })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const existing = await db.select().from(forumReactions)
      .where(and(eq(forumReactions.postId, input.postId), eq(forumReactions.userId, ctx.user.id), eq(forumReactions.emoji, input.emoji))).limit(1);
    if (existing[0]) {
      await db.delete(forumReactions).where(eq(forumReactions.id, existing[0].id));
      return { success: true, added: false };
    }
    await db.insert(forumReactions).values({ postId: input.postId, userId: ctx.user.id, emoji: input.emoji });
    return { success: true, added: true };
  }),

  togglePin: adminQuery.input(z.object({ postId: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    const posts = await db.select().from(forumPosts).where(eq(forumPosts.id, input.postId)).limit(1);
    if (posts[0]) await db.update(forumPosts).set({ isPinned: !posts[0].isPinned }).where(eq(forumPosts.id, input.postId));
    return { success: true, isPinned: !posts[0]?.isPinned };
  }),

  toggleLock: adminQuery.input(z.object({ postId: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    const posts = await db.select().from(forumPosts).where(eq(forumPosts.id, input.postId)).limit(1);
    if (posts[0]) await db.update(forumPosts).set({ isLocked: !posts[0].isLocked }).where(eq(forumPosts.id, input.postId));
    return { success: true, isLocked: !posts[0]?.isLocked };
  }),

  getLeaderboard: publicQuery.input(z.object({ period: z.enum(["all", "week", "month"]).default("all"), limit: z.number().default(10) })).query(async ({ input }) => {
    const db = getDb();
    const since = input.period === "week" ? new Date(Date.now() - 7 * 86400000) : input.period === "month" ? new Date(Date.now() - 30 * 86400000) : new Date(0);
    const postCounts = await db.select({ authorId: forumPosts.authorId, count: count() }).from(forumPosts)
      .where(input.period !== "all" ? gte(forumPosts.createdAt, since) : undefined)
      .groupBy(forumPosts.authorId).orderBy(desc(count())).limit(input.limit);
    return Promise.all(postCounts.map(async (pc) => {
      const u = await db.select().from(users).where(eq(users.id, pc.authorId)).limit(1);
      return { ...pc, author: await enrichUser(u[0]) };
    }));
  }),

  getRecentActivity: publicQuery.input(z.object({ limit: z.number().default(10) })).query(async ({ input }) => {
    const db = getDb();
    const posts = await db.select().from(forumPosts).orderBy(desc(forumPosts.createdAt)).limit(input.limit);
    return Promise.all(posts.map(async (p) => {
      const u = await db.select().from(users).where(eq(users.id, p.authorId)).limit(1);
      return { ...p, author: u[0] ?? null };
    }));
  }),

  getSubforumStats: publicQuery.query(async () => {
    const db = getDb();
    const categories = ["general", "anime", "gaming", "trading", "3dprints", "offtopic"];
    return Promise.all(categories.map(async (cat) => {
      const postCount = await db.select({ count: count() }).from(forumPosts).where(eq(forumPosts.category, cat));
      const latest = await db.select().from(forumPosts).where(eq(forumPosts.category, cat)).orderBy(desc(forumPosts.createdAt)).limit(1);
      const latestPost = latest[0] ?? null;
      let latestAuthor = null;
      if (latestPost) { const u = await db.select().from(users).where(eq(users.id, latestPost.authorId)).limit(1); latestAuthor = u[0] ?? null; }
      return { category: cat, postCount: postCount[0]?.count || 0, latestPost: latestPost ? { title: latestPost.title, createdAt: latestPost.createdAt, authorName: latestAuthor?.name ?? latestAuthor?.username ?? "Unknown" } : null };
    }));
  }),

  listFriends: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.select().from(friends).where(eq(friends.addresseeId, ctx.user.id));
    return Promise.all(rows.map(async (f) => { const u = await db.select().from(users).where(eq(users.id, f.requesterId)).limit(1); return { ...f, requester: u[0] ?? null }; }));
  }),

  sendFriendRequest: authedQuery.input(z.object({ addresseeId: z.number() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    await db.insert(friends).values({ requesterId: ctx.user.id, addresseeId: input.addresseeId });
    await createNotification({ userId: input.addresseeId, type: "friend_request", title: "New friend request", message: `${ctx.user.name ?? ctx.user.username} sent you a friend request`, link: `/profile/${ctx.user.id}` });
    return { success: true };
  }),
});
