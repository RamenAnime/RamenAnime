import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { pageViews, searchQueries, userEvents, productViews, userSessions, users, marketplaceListings } from "@db/schema";
import { eq, desc, count, sql, and, gte } from "drizzle-orm";

function hashIp(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(16, "0");
}

function generateSessionId(): string {
  return "sess_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const analyticsRouter = createRouter({
  // Track page view
  trackPageView: publicQuery
    .input(z.object({
      path: z.string().max(255),
      referrer: z.string().max(500).optional(),
      duration: z.number().optional(),
      sessionId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const ip = ctx.req.headers.get("x-forwarded-for") || ctx.req.headers.get("x-real-ip") || "unknown";
      const userAgent = ctx.req.headers.get("user-agent") || "";
      const sessionId = input.sessionId || generateSessionId();
      
      await db.insert(pageViews).values({
        userId: ctx.user?.id || null,
        ipHash: hashIp(ip),
        path: input.path,
        referrer: input.referrer || null,
        userAgent: userAgent.slice(0, 255),
        sessionId,
        duration: input.duration || 0,
      });

      const existingSession = await db.query.userSessions.findFirst({
        where: eq(userSessions.sessionId, sessionId),
      });
      if (!existingSession) {
        await db.insert(userSessions).values({
          userId: ctx.user?.id || null,
          sessionId,
          ipHash: hashIp(ip),
          userAgent: userAgent.slice(0, 255),
          pageViews: 1,
        });
      } else {
        await db
          .update(userSessions)
          .set({
            pageViews: sql`${userSessions.pageViews} + 1`,
            endedAt: new Date(),
          })
          .where(eq(userSessions.id, existingSession.id));
      }

      return { sessionId };
    }),

  // Track search query
  trackSearch: publicQuery
    .input(z.object({
      query: z.string().max(500),
      category: z.string().optional(),
      resultsCount: z.number().optional(),
      clickedListingId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.insert(searchQueries).values({
        userId: ctx.user?.id || null,
        query: input.query,
        category: input.category || null,
        resultsCount: input.resultsCount || 0,
        clickedListingId: input.clickedListingId || null,
      });
      return { success: true };
    }),

  // Track user event (click, purchase attempt, etc.)
  trackEvent: publicQuery
    .input(z.object({
      eventType: z.string().max(50),
      eventData: z.string().optional(),
      pagePath: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const ip = ctx.req.headers.get("x-forwarded-for") || ctx.req.headers.get("x-real-ip") || "unknown";
      await db.insert(userEvents).values({
        userId: ctx.user?.id || null,
        eventType: input.eventType,
        eventData: input.eventData || null,
        pagePath: input.pagePath || null,
        ipHash: hashIp(ip),
      });
      return { success: true };
    }),

  // Track product view
  trackProductView: publicQuery
    .input(z.object({ listingId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      if (!ctx.user?.id) {
        await db.insert(productViews).values({
          userId: null,
          listingId: input.listingId,
        });
        return { success: true };
      }
      const existing = await db.query.productViews.findFirst({
        where: and(eq(productViews.userId, ctx.user.id), eq(productViews.listingId, input.listingId)),
      });
      if (existing) {
        await db
          .update(productViews)
          .set({ viewCount: sql`${productViews.viewCount} + 1`, lastViewedAt: new Date() })
          .where(eq(productViews.id, existing.id));
      } else {
        await db.insert(productViews).values({
          userId: ctx.user.id,
          listingId: input.listingId,
        });
      }
      return { success: true };
    }),

  // Admin: Get overview stats
  getOverview: adminQuery.query(async () => {
    const db = getDb();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [totalPageViews] = await db.select({ count: count() }).from(pageViews);
    const [todayPageViews] = await db.select({ count: count() }).from(pageViews).where(gte(pageViews.createdAt, today));
    const [totalSearches] = await db.select({ count: count() }).from(searchQueries);
    const [totalEvents] = await db.select({ count: count() }).from(userEvents);
    const [activeSessions] = await db.select({ count: count() }).from(userSessions).where(gte(userSessions.startedAt, new Date(Date.now() - 24 * 60 * 60 * 1000)));
    const [uniqueVisitorsRow] = await db
      .select({ count: sql<number>`count(distinct ${pageViews.sessionId})` })
      .from(pageViews)
      .where(and(gte(pageViews.createdAt, today), sql`${pageViews.sessionId} is not null`));
    const uniqueVisitors = { count: Number(uniqueVisitorsRow?.count ?? 0) };

    // Top pages today
    const topPages = await db.select({
      path: pageViews.path,
      views: count(),
    }).from(pageViews)
      .where(gte(pageViews.createdAt, today))
      .groupBy(pageViews.path)
      .orderBy(desc(count()))
      .limit(10);

    // Top searches
    const topSearches = await db.select({
      query: searchQueries.query,
      count: count(),
    }).from(searchQueries)
      .groupBy(searchQueries.query)
      .orderBy(desc(count()))
      .limit(10);

    // Hourly page views for chart (last 24 hours)
    const hourlyViews = await db.select({
      hour: sql`DATE_FORMAT(${pageViews.createdAt}, '%H:00')`,
      views: count(),
    }).from(pageViews)
      .where(gte(pageViews.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)))
      .groupBy(sql`DATE_FORMAT(${pageViews.createdAt}, '%H')`)
      .orderBy(sql`DATE_FORMAT(${pageViews.createdAt}, '%H')`);

    return {
      totalPageViews: totalPageViews.count,
      todayPageViews: todayPageViews.count,
      totalSearches: totalSearches.count,
      totalEvents: totalEvents.count,
      activeSessions: activeSessions.count,
      uniqueVisitors: uniqueVisitors.count,
      topPages,
      topSearches,
      hourlyViews,
    };
  }),

  // Admin: Get all users with analytics summary
  getUsersAnalytics: adminQuery.query(async () => {
    const db = getDb();
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    
    const userAnalytics = await Promise.all(allUsers.map(async (u) => {
      const [views] = await db.select({ count: count() }).from(pageViews).where(eq(pageViews.userId, u.id));
      const [searches] = await db.select({ count: count() }).from(searchQueries).where(eq(searchQueries.userId, u.id));
      const [events] = await db.select({ count: count() }).from(userEvents).where(eq(userEvents.userId, u.id));
      const [productV] = await db.select({ count: count() }).from(productViews).where(eq(productViews.userId, u.id));
      const lastActivity = await db.query.pageViews.findFirst({
        where: eq(pageViews.userId, u.id),
        orderBy: desc(pageViews.createdAt),
      });
      
      return {
        ...u,
        pageViews: views.count,
        searches: searches.count,
        events: events.count,
        productViews: productV.count,
        lastActive: lastActivity?.createdAt || null,
      };
    }));
    
    return userAnalytics;
  }),

  // Admin: Get individual user detailed analytics
  getUserDetail: adminQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const user = await db.query.users.findFirst({ where: eq(users.id, input.userId) });
      if (!user) throw new Error("User not found");

      const views = await db.query.pageViews.findMany({
        where: eq(pageViews.userId, input.userId),
        orderBy: desc(pageViews.createdAt),
        limit: 100,
      });
      const searches = await db.query.searchQueries.findMany({
        where: eq(searchQueries.userId, input.userId),
        orderBy: desc(searchQueries.createdAt),
        limit: 50,
      });
      const events = await db.query.userEvents.findMany({
        where: eq(userEvents.userId, input.userId),
        orderBy: desc(userEvents.createdAt),
        limit: 100,
      });
      const products = await db.query.productViews.findMany({
        where: eq(productViews.userId, input.userId),
        with: { listing: true },
        orderBy: desc(productViews.lastViewedAt),
        limit: 50,
      });

      return { user, views, searches, events, products };
    }),

  // Admin: Get user trends/predictions (what they might buy)
  getUserTrends: adminQuery
    .input(z.object({ userId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      
      // Get top viewed categories
      const categoryViewsBase = db.select({
        category: marketplaceListings.category,
        count: count(),
      }).from(productViews)
        .innerJoin(marketplaceListings, eq(productViews.listingId, marketplaceListings.id));
      const categoryViews = await (input.userId
        ? categoryViewsBase.where(eq(productViews.userId, input.userId))
        : categoryViewsBase
      ).groupBy(marketplaceListings.category)
        .orderBy(desc(count()))
        .limit(5);

      // Get top searched terms
      const searchTermsBase = db.select({
        query: searchQueries.query,
        count: count(),
      }).from(searchQueries);
      const searchTerms = await (input.userId
        ? searchTermsBase.where(eq(searchQueries.userId, input.userId))
        : searchTermsBase
      ).groupBy(searchQueries.query)
        .orderBy(desc(count()))
        .limit(10);

      // Get users with high engagement but no purchase
      const window = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const hotProspects = await db.select({
        userId: pageViews.userId,
        views: count(),
      }).from(pageViews)
        .where(gte(pageViews.createdAt, window))
        .groupBy(pageViews.userId)
        .having(sql`${count()} > 10`)
        .orderBy(desc(count()))
        .limit(20);

      return { categoryViews, searchTerms, hotProspects };
    }),
});
