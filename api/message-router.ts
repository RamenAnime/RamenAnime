import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { messages, users } from "@db/schema";
import { eq, or, and, desc, gt, sql } from "drizzle-orm";
import { createNotification } from "./lib/notify";

export const messageRouter = createRouter({
  /** Inbox threads grouped by conversation partner */
  threads: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const uid = ctx.user.id;
    const rows = await db
      .select({
        id: messages.id,
        senderId: messages.senderId,
        recipientId: messages.recipientId,
        subject: messages.subject,
        body: messages.body,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(
        and(
          or(eq(messages.senderId, uid), eq(messages.recipientId, uid)),
          or(
            and(eq(messages.senderId, uid), eq(messages.senderDeleted, false)),
            and(eq(messages.recipientId, uid), eq(messages.recipientDeleted, false))
          )
        )
      )
      .orderBy(desc(messages.createdAt))
      .limit(500);

    const partnerMap = new Map<
      number,
      { partnerId: number; lastMessage: string; lastAt: Date; unread: number; subject: string }
    >();

    for (const m of rows) {
      const partnerId = m.senderId === uid ? m.recipientId : m.senderId;
      const existing = partnerMap.get(partnerId);
      const unread = m.recipientId === uid && !m.isRead ? 1 : 0;
      if (!existing) {
        partnerMap.set(partnerId, {
          partnerId,
          lastMessage: m.body.slice(0, 120),
          lastAt: m.createdAt,
          unread,
          subject: m.subject,
        });
      } else if (unread) {
        existing.unread += 1;
      }
    }

    const partners = [...partnerMap.values()].sort(
      (a, b) => b.lastAt.getTime() - a.lastAt.getTime()
    );

    const enriched = await Promise.all(
      partners.map(async (p) => {
        const u = await db.query.users.findFirst({
          where: eq(users.id, p.partnerId),
          columns: { id: true, name: true, username: true },
        });
        return { ...p, partnerName: u?.name || u?.username || `User #${p.partnerId}` };
      })
    );

    return enriched;
  }),

  /** Messages with a specific user (poll every few seconds from client) */
  withUser: authedQuery
    .input(
      z.object({
        otherUserId: z.number(),
        afterId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const uid = ctx.user.id;
      const conds = [
        or(
          and(eq(messages.senderId, uid), eq(messages.recipientId, input.otherUserId)),
          and(eq(messages.senderId, input.otherUserId), eq(messages.recipientId, uid))
        ),
      ];
      if (input.afterId) {
        conds.push(gt(messages.id, input.afterId));
      }

      const rows = await db
        .select()
        .from(messages)
        .where(and(...conds))
        .orderBy(messages.createdAt)
        .limit(100);

      await db
        .update(messages)
        .set({ isRead: true })
        .where(
          and(
            eq(messages.recipientId, uid),
            eq(messages.senderId, input.otherUserId),
            eq(messages.isRead, false)
          )
        );

      return rows;
    }),

  send: authedQuery
    .input(
      z.object({
        recipientId: z.number(),
        body: z.string().min(1).max(4000),
        subject: z.string().max(255).optional(),
        listingId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.recipientId === ctx.user.id) throw new Error("Cannot message yourself");
      const db = getDb();
      const subject =
        input.subject ||
        (input.listingId ? `Listing #${input.listingId}` : "Direct message");

      const [{ id }] = await db
        .insert(messages)
        .values({
          senderId: ctx.user.id,
          recipientId: input.recipientId,
          subject,
          body: input.body,
        })
        .$returningId();

      await createNotification({
        userId: input.recipientId,
        type: "message",
        title: "New message",
        message: `${ctx.user.name || "Someone"} sent you a message`,
        link: `/messages?user=${ctx.user.id}`,
      });

      return { id, createdAt: new Date() };
    }),

  unreadCount: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.recipientId, ctx.user.id),
          eq(messages.isRead, false),
          eq(messages.recipientDeleted, false)
        )
      );
    return { count: Number(row?.count ?? 0) };
  }),

  deleteThread: authedQuery
    .input(z.object({ otherUserId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const uid = ctx.user.id;
      await db
        .update(messages)
        .set({ senderDeleted: true })
        .where(
          and(eq(messages.senderId, uid), eq(messages.recipientId, input.otherUserId))
        );
      await db
        .update(messages)
        .set({ recipientDeleted: true })
        .where(
          and(eq(messages.recipientId, uid), eq(messages.senderId, input.otherUserId))
        );
      return { success: true };
    }),
});
