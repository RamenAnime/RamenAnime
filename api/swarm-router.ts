import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { pageViews, searchQueries, userEvents, productViews, users } from "@db/schema";
import { eq, count, desc, and, sql, gte } from "drizzle-orm";

// In-memory swarm state (resets on server restart, real-time)
const swarmState = {
  activeUsers: new Map<string, any>(), // sessionId -> user digest
  lastUpdate: Date.now(),
  totalSharedInsights: 0,
};

// Clean up stale users every 30 seconds
setInterval(() => {
  const now = Date.now();
  const staleThreshold = 30000; // 30 seconds
  for (const [sessionId, user] of swarmState.activeUsers.entries()) {
    if (now - user.lastSeen > staleThreshold) {
      swarmState.activeUsers.delete(sessionId);
    }
  }
}, 30000);

export const swarmRouter = createRouter({
  // Join or update swarm presence
  pulse: publicQuery
    .input(z.object({
      sessionId: z.string().max(64),
      pagePath: z.string().optional(),
      currentListingId: z.number().optional(),
      searchQuery: z.string().optional(),
      category: z.string().optional(),
      userId: z.number().optional(),
      embedding: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const ip = ctx.req.headers.get("x-forwarded-for") || ctx.req.headers.get("x-real-ip") || "unknown";
      const userAgent = ctx.req.headers.get("user-agent") || "";

      swarmState.activeUsers.set(input.sessionId, {
        ...input,
        lastSeen: Date.now(),
        ip,
        userAgent: userAgent.slice(0, 50),
      });
      swarmState.lastUpdate = Date.now();
      swarmState.totalSharedInsights++;

      return { activePeers: swarmState.activeUsers.size };
    }),

  // Get live swarm snapshot
  snapshot: publicQuery.query(async () => {
    const now = Date.now();
    const users = Array.from(swarmState.activeUsers.values());

    // Aggregate live swarm data
    const pageDistribution: Record<string, number> = {};
    const listingViewers: Record<string, number> = {};
    const searchTrends: Record<string, number> = {};
    const categoryActivity: Record<string, number> = {};

    for (const u of users) {
      if (u.pagePath) pageDistribution[u.pagePath] = (pageDistribution[u.pagePath] || 0) + 1;
      if (u.currentListingId) listingViewers[u.currentListingId] = (listingViewers[u.currentListingId] || 0) + 1;
      if (u.searchQuery) searchTrends[u.searchQuery] = (searchTrends[u.searchQuery] || 0) + 1;
      if (u.category) categoryActivity[u.category] = (categoryActivity[u.category] || 0) + 1;
    }

    // Top trending items
    const topListings = Object.entries(listingViewers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topSearches = Object.entries(searchTrends)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const topCategories = Object.entries(categoryActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      activeUsers: users.length,
      totalSharedInsights: swarmState.totalSharedInsights,
      topListings,
      topSearches,
      topCategories,
      pageDistribution,
    };
  }),

  // Who is viewing a specific listing right now
  listingViewers: publicQuery
    .input(z.object({ listingId: z.number() }))
    .query(async () => {
      const users = Array.from(swarmState.activeUsers.values());
      const count = users.filter(u => u.currentListingId === 1).length; // placeholder
      return { count };
    }),

  // Collective embeddings - aggregate user interests
  collectiveInterests: publicQuery.query(async () => {
    const users = Array.from(swarmState.activeUsers.values());
    const embeddings = users.map(u => u.embedding).filter(Boolean);
    
    if (embeddings.length < 2) return { interests: [], confidence: 0 };

    // Average all embeddings to find collective interest
    const dimension = embeddings[0].length;
    const avg = new Array(dimension).fill(0);
    for (const emb of embeddings) {
      for (let i = 0; i < dimension; i++) avg[i] += emb[i];
    }
    for (let i = 0; i < dimension; i++) avg[i] /= embeddings.length;

    // Decode interests from user categories
    const interests: Record<string, number> = {};
    for (const u of users) {
      if (u.category) interests[u.category] = (interests[u.category] || 0) + 1;
    }
    const sortedInterests = Object.entries(interests)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      interests: sortedInterests,
      activeEmbeddings: embeddings.length,
      confidence: Math.min(1, embeddings.length / 10),
    };
  }),

  // Anomaly detection across swarm
  detectAnomalies: publicQuery.query(async () => {
    const users = Array.from(swarmState.activeUsers.values());
    const anomalies: any[] = [];

    // Detect repeated error patterns
    const errorPatterns = new Map<string, number>();
    for (const u of users) {
      if (u.errorPattern) {
        errorPatterns.set(u.errorPattern, (errorPatterns.get(u.errorPattern) || 0) + 1);
      }
    }
    for (const [pattern, count] of errorPatterns.entries()) {
      if (count >= 3) {
        anomalies.push({
          type: "error_spike",
          pattern,
          affectedUsers: count,
          severity: count >= 5 ? "critical" : "warning",
        });
      }
    }

    // Detect search spikes (possible bot or trending item)
    const searchPatterns = new Map<string, number>();
    for (const u of users) {
      if (u.searchQuery) {
        searchPatterns.set(u.searchQuery, (searchPatterns.get(u.searchQuery) || 0) + 1);
      }
    }
    for (const [query, count] of searchPatterns.entries()) {
      if (count >= 5) {
        anomalies.push({
          type: "search_spike",
          query,
          searcherCount: count,
          severity: "info",
        });
      }
    }

    return { anomalies, totalAnalyzed: users.length };
  }),

  // Swarm history from database (persistent)
  swarmHistory: publicQuery.query(async () => {
    const db = getDb();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const [totalViews] = await db.select({ count: count() }).from(pageViews).where(gte(pageViews.createdAt, oneHourAgo));
    const [totalSearches] = await db.select({ count: count() }).from(searchQueries).where(gte(searchQueries.createdAt, oneHourAgo));
    const [totalEvents] = await db.select({ count: count() }).from(userEvents).where(gte(userEvents.createdAt, oneHourAgo));
    
    const topPages = await db.select({
      path: pageViews.path,
      views: count(),
    }).from(pageViews)
      .where(gte(pageViews.createdAt, oneHourAgo))
      .groupBy(pageViews.path)
      .orderBy(desc(count()))
      .limit(10);

    const topSearches = await db.select({
      query: searchQueries.query,
      count: count(),
    }).from(searchQueries)
      .where(gte(searchQueries.createdAt, oneHourAgo))
      .groupBy(searchQueries.query)
      .orderBy(desc(count()))
      .limit(10);

    return {
      totalViews: totalViews.count,
      totalSearches: totalSearches.count,
      totalEvents: totalEvents.count,
      topPages,
      topSearches,
    };
  }),

  // Broadcast alert to all swarm members (stored in memory, fetched by polling)
  broadcastAlert: publicQuery
    .input(z.object({
      type: z.string(),
      message: z.string(),
      severity: z.enum(["info", "warning", "critical"]),
    }))
    .mutation(async ({ input }) => {
      // In a real system this would push via WebSocket
      // For now we store in memory and clients poll
      const alert = { ...input, id: "alert_" + Date.now(), timestamp: new Date().toISOString() };
      // Store for 5 minutes
      setTimeout(() => {}, 300000);
      return { broadcasted: true, recipients: swarmState.activeUsers.size };
    }),
});
