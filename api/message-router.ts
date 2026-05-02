import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { messages, users } from "@db/schema";
import { eq, and, desc } from "drizzle-orm";
import { createNotification } from "./queries/users";

export const messageRouter = createRouter({
  send: authedQuery
    .input(z.object({
      recipientId: z.number().min(1),
      subject: z.string().min(1).max(255),
      body: z.string().min(1).max(5000),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.recipientId === ctx.user.id) {
        throw new Error("Cannot send message to yourself.");
      }
      const db = getDb();
      const recipient = await db.select().from(users).where(eq(users.id, input.recipientId)).limit(1);
      if (!recipient[0]) throw new Error("Recipient not found.");

      await db.insert(messages).values({
        senderId: ctx.user.id,
        recipientId: input.recipientId,
        subject: input.subject,
        body: input.body,
      });

      await createNotification({
        userId: input.recipientId,
        type: "message",
        title: `New message from ${ctx.user.name ?? ctx.user.username}`,
        message: input.subject,
        link: "/messages",
      });

      return { success: true };
    }),

  inbox: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.select().from(messages)
      .where(and(eq(messages.recipientId, ctx.user.id), eq(messages.recipientDeleted, false)))
      .orderBy(desc(messages.createdAt)).limit(50);
    return Promise.all(rows.map(async (m) => {
      const u = await db.select().from(users).where(eq(users.id, m.senderId)).limit(1);
      return { ...m, senderName: u[0]?.name ?? u[0]?.username ?? "Unknown" };
    }));
  }),

  sent: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.select().from(messages)
      .where(and(eq(messages.senderId, ctx.user.id), eq(messages.senderDeleted, false)))
      .orderBy(desc(messages.createdAt)).limit(50);
    return Promise.all(rows.map(async (m) => {
      const u = await db.select().from(users).where(eq(users.id, m.recipientId)).limit(1);
      return { ...m, recipientName: u[0]?.name ?? u[0]?.username ?? "Unknown" };
    }));
  }),

  get: authedQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const rows = await db.select().from(messages).where(eq(messages.id, input.id)).limit(1);
      const msg = rows[0];
      if (!msg) throw new Error("Message not found.");
      if (msg.recipientId !== ctx.user.id && msg.senderId !== ctx.user.id) {
        throw new Error("Access denied.");
      }
      if (msg.recipientId === ctx.user.id && !msg.isRead) {
        await db.update(messages).set({ isRead: true }).where(eq(messages.id, input.id));
      }
      const sender = await db.select().from(users).where(eq(users.id, msg.senderId)).limit(1);
      const recipient = await db.select().from(users).where(eq(users.id, msg.recipientId)).limit(1);
      return {
        ...msg,
        senderName: sender[0]?.name ?? sender[0]?.username ?? "Unknown",
        recipientName: recipient[0]?.name ?? recipient[0]?.username ?? "Unknown",
      };
    }),

  unreadCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const rows = await db.select().from(messages).where(
      and(eq(messages.recipientId, ctx.user.id), eq(messages.isRead, false), eq(messages.recipientDeleted, false))
    );
    return rows.length;
  }),

  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const rows = await db.select().from(messages).where(eq(messages.id, input.id)).limit(1);
      const msg = rows[0];
      if (!msg) throw new Error("Message not found.");
      if (msg.recipientId === ctx.user.id) {
        await db.update(messages).set({ recipientDeleted: true }).where(eq(messages.id, input.id));
      } else if (msg.senderId === ctx.user.id) {
        await db.update(messages).set({ senderDeleted: true }).where(eq(messages.id, input.id));
      } else {
        throw new Error("Access denied.");
      }
      return { success: true };
    }),
});
