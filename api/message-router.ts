import { randomUUID } from "crypto";
import { z } from "zod";
import { db } from "./db";
import { createRouter, publicQuery, authedQuery } from "./middleware";

const typingStore = new Map();
function notifyTyping(cid: string, uid: string, typing: boolean) {
  const s = typingStore.get(cid) ?? new Set<string>();
  typing ? s.add(uid) : s.delete(uid);
  typingStore.set(cid, s);
}

export const messageRouter = createRouter({
  conversations: authedQuery.query(async ({ ctx }) => {
    return db.execute(
      `SELECT c.id, c.title, c.created_at, c.updated_at,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id=c.id AND m.read=0 AND m.sender_id!=?) as unread_count,
        (SELECT content FROM messages WHERE conversation_id=c.id ORDER BY created_at DESC LIMIT 1) as last_message
       FROM conversations c
       JOIN conversation_participants cp ON cp.conversation_id=c.id
       WHERE cp.user_id=?
       ORDER BY c.updated_at DESC`,
      [ctx.user.id, ctx.user.id]
    );
  }),

  messages: authedQuery
    .input(z.object({ conversationId: z.string(), cursor: z.string().optional(), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const { conversationId, cursor, limit } = input;
      const rows = await db.execute(
        `SELECT m.id, m.sender_id, m.content, m.created_at, m.updated_at, m.read, m.reactions, m.edited, u.username
         FROM messages m JOIN users u ON u.id=m.sender_id
         WHERE m.conversation_id=? ${cursor ? "AND m.created_at<?" : ""}
         ORDER BY m.created_at DESC LIMIT ?`,
        cursor ? [conversationId, cursor, limit + 1] : [conversationId, limit + 1]
      );
      const items = rows.slice(0, limit);
      const nextCursor = rows.length > limit ? rows[limit]?.created_at : undefined;
      await db.execute(
        `UPDATE messages SET read=1 WHERE conversation_id=? AND sender_id!=? AND read=0`,
        [conversationId, ctx.user.id]
      );
      return { items, nextCursor };
    }),

  send: authedQuery
    .input(z.object({ conversationId: z.string(), content: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const id = randomUUID();
      const now = new Date().toISOString();
      await db.execute(
        `INSERT INTO messages (id, conversation_id, sender_id, content, created_at, updated_at, read, reactions)
         VALUES (?, ?, ?, ?, ?, ?, 0, '[]')`,
        [id, input.conversationId, ctx.user.id, input.content, now, now]
      );
      await db.execute(`UPDATE conversations SET updated_at=? WHERE id=?`, [now, input.conversationId]);
      return { id, createdAt: now };
    }),

  edit: authedQuery
    .input(z.object({ messageId: z.string(), content: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date().toISOString();
      const ownerCheck = await db.execute(
        `SELECT id FROM messages WHERE id=? AND sender_id=?`,
        [input.messageId, ctx.user.id]
      );
      if (!ownerCheck.length) throw new Error("Not found or not owner");
      await db.execute(
        `UPDATE messages SET content=?, updated_at=?, edited=1 WHERE id=?`,
        [input.content, now, input.messageId]
      );
      return { success: true, updatedAt: now };
    }),

  delete: authedQuery
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.execute(`DELETE FROM messages WHERE id=? AND sender_id=?`, [input.messageId, ctx.user.id]);
      return { success: true };
    }),

  react: authedQuery
    .input(z.object({ messageId: z.string(), emoji: z.string().min(1).max(10) }))
    .mutation(async ({ ctx, input }) => {
      const rows = await db.execute(`SELECT reactions FROM messages WHERE id=?`, [input.messageId]);
      if (!rows.length) throw new Error("Message not found");
      let reactions = JSON.parse(rows[0].reactions || "[]");
      reactions = reactions.filter((r: any) => !(r.userId === ctx.user.id && r.emoji === input.emoji));
      reactions.push({ userId: ctx.user.id, emoji: input.emoji });
      await db.execute(`UPDATE messages SET reactions=? WHERE id=?`, [JSON.stringify(reactions), input.messageId]);
      return { success: true, reactions };
    }),

  typing: authedQuery
    .input(z.object({ conversationId: z.string(), isTyping: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      notifyTyping(input.conversationId, ctx.user.id, input.isTyping);
      return { success: true };
    }),

  whoIsTyping: publicQuery
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ input }) => {
      return { userIds: Array.from(typingStore.get(input.conversationId) ?? []) };
    }),
});