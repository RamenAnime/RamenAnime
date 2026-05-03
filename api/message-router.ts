import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { db } from "../../db";
import { messages, users } from "../db/schema";
import { eq, and, or, desc, sql, lt } from "drizzle-orm";

const typingStore = new Map<number, Map<number, number>>();
const TYPING_TTL = 5000;
setInterval(() => {
  const now = Date.now();
  for (const [uid, recips] of typingStore) {
    for (const [rid, ts] of recips) { if (now - ts > TYPING_TTL) recips.delete(rid); }
    if (recips.size === 0) typingStore.delete(uid);
  }
}, 10000);

export const messageRouter = createRouter({
  getConversations: authedQuery.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const result = await db.select({
      otherUserId: sql<number>`CASE WHEN ${messages.senderId} = ${userId} THEN ${messages.recipientId} ELSE ${messages.senderId} END`,
      lastMessageAt: sql<string>`MAX(${messages.createdAt})`,
      unreadCount: sql<number>`SUM(CASE WHEN ${messages.recipientId} = ${userId} AND ${messages.read} = false THEN 1 ELSE 0 END)`,
    }).from(messages).where(or(eq(messages.senderId, userId), eq(messages.recipientId, userId)))
      .groupBy(sql`CASE WHEN ${messages.senderId} = ${userId} THEN ${messages.recipientId} ELSE ${messages.senderId} END`)
      .orderBy(desc(sql`MAX(${messages.createdAt})`));

    const conversations = [];
    for (const conv of result) {
      const [otherUser] = await db.select({ id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl, lastActive: users.lastActive }).from(users).where(eq(users.id, conv.otherUserId)).limit(1);
      if (otherUser) conversations.push({ ...conv, otherUser, isOnline: otherUser.lastActive ? Date.now() - new Date(otherUser.lastActive).getTime() < 5 * 60 * 1000 : false });
    }
    return conversations;
  }),

  getMessages: authedQuery.input(z.object({ otherUserId: z.number(), cursor: z.number().optional(), limit: z.number().default(50) })).query(async ({ ctx, input }) => {
    const userId = ctx.user.id;
    const { otherUserId, cursor, limit } = input;
    const conditions = [or(and(eq(messages.senderId, userId), eq(messages.recipientId, otherUserId)), and(eq(messages.senderId, otherUserId), eq(messages.recipientId, userId)))];
    if (cursor) conditions.push(lt(messages.id, cursor));

    const result = await db.select({ id: messages.id, senderId: messages.senderId, recipientId: messages.recipientId, content: messages.content, createdAt: messages.createdAt, read: messages.read, readAt: messages.readAt, attachments: messages.attachments, editedAt: messages.editedAt, replyToId: messages.replyToId, reactions: messages.reactions }).from(messages).where(and(...conditions)).orderBy(desc(messages.createdAt)).limit(limit);

    await db.update(messages).set({ read: true, readAt: new Date() }).where(and(eq(messages.recipientId, userId), eq(messages.senderId, otherUserId), eq(messages.read, false)));
    return { messages: result.reverse(), nextCursor: result.length === limit ? result[result.length - 1]?.id : undefined };
  }),

  sendMessage: authedQuery.input(z.object({ recipientId: z.number(), content: z.string().min(1).max(5000), attachments: z.array(z.string().url()).max(5).optional(), replyToId: z.number().optional() })).mutation(async ({ ctx, input }) => {
    const [message] = await db.insert(messages).values({ senderId: ctx.user.id, recipientId: input.recipientId, content: input.content, attachments: input.attachments || [], replyToId: input.replyToId, read: false }).returning();
    return message;
  }),

  editMessage: authedQuery.input(z.object({ messageId: z.number(), content: z.string().min(1).max(5000) })).mutation(async ({ ctx, input }) => {
    const [msg] = await db.select().from(messages).where(eq(messages.id, input.messageId)).limit(1);
    if (!msg || msg.senderId !== ctx.user.id) throw new Error("Unauthorized");
    if (Date.now() - new Date(msg.createdAt).getTime() > 15 * 60 * 1000) throw new Error("Too old");
    await db.update(messages).set({ content: input.content, editedAt: new Date() }).where(eq(messages.id, input.messageId));
    return { success: true };
  }),

  deleteMessage: authedQuery.input(z.object({ messageId: z.number() })).mutation(async ({ ctx, input }) => {
    const [msg] = await db.select().from(messages).where(eq(messages.id, input.messageId)).limit(1);
    if (!msg || (msg.senderId !== ctx.user.id && msg.recipientId !== ctx.user.id)) throw new Error("Unauthorized");
    await db.delete(messages).where(eq(messages.id, input.messageId));
    return { success: true };
  }),

  react: authedQuery.input(z.object({ messageId: z.number(), emoji: z.string().min(1).max(10) })).mutation(async ({ ctx, input }) => {
    const [msg] = await db.select().from(messages).where(eq(messages.id, input.messageId)).limit(1);
    if (!msg || (msg.senderId !== ctx.user.id && msg.recipientId !== ctx.user.id)) throw new Error("Unauthorized");
    const reactions = (msg.reactions || {}) as Record<string, number[]>;
    if (!reactions[input.emoji]) reactions[input.emoji] = [];
    const idx = reactions[input.emoji].indexOf(ctx.user.id);
    if (idx === -1) reactions[input.emoji].push(ctx.user.id); else reactions[input.emoji].splice(idx, 1);
    if (reactions[input.emoji].length === 0) delete reactions[input.emoji];
    await db.update(messages).set({ reactions }).where(eq(messages.id, input.messageId));
    return { success: true, reactions };
  }),

  typing: authedQuery.input(z.object({ recipientId: z.number(), isTyping: z.boolean() })).mutation(async ({ ctx, input }) => {
    if (!typingStore.has(ctx.user.id)) typingStore.set(ctx.user.id, new Map());
    if (input.isTyping) typingStore.get(ctx.user.id)?.set(input.recipientId, Date.now());
    else typingStore.get(ctx.user.id)?.delete(input.recipientId);
    return { success: true };
  }),

  getTyping: authedQuery.input(z.object({ otherUserId: z.number() })).query(async ({ ctx, input }) => {
    const ts = typingStore.get(input.otherUserId)?.get(ctx.user.id);
    if (!ts) return { isTyping: false };
    if (Date.now() - ts > TYPING_TTL) { typingStore.get(input.otherUserId)?.delete(ctx.user.id); return { isTyping: false }; }
    return { isTyping: true };
  }),

  getUnreadCount: authedQuery.query(async ({ ctx }) => {
    const result = await db.select({ count: sql<number>`COUNT(*)` }).from(messages).where(and(eq(messages.recipientId, ctx.user.id), eq(messages.read, false)));
    return result[0]?.count || 0;
  }),
});
