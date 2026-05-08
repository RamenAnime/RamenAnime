// Hybrid rate limiter: database-backed (primary) with in-memory fallback.
  // Database persistence ensures limits hold across server restarts and multiple instances.

  import { getDb } from "../queries/connection";
  import { rateLimitLogs } from "@db/schema";
  import { eq, and, gte, lt, count, sql as drizzleSql } from "drizzle-orm";

  interface RateLimitEntry {
    count: number;
    resetTime: number;
  }

  const memoryStore = new Map<string, RateLimitEntry>();
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const MAX_REQUESTS = 5;

  export async function checkRateLimit(ip: string, action: string): Promise<{ allowed: boolean; retryAfter: number }> {
    const key = `${ip}:${action}`;
    const now = new Date();
    const windowStart = new Date(Date.now() - WINDOW_MS);

    try {
      const db = getDb();

      // Delete entries older than the 15-minute window (expired)
      await db.delete(rateLimitLogs).where(
        and(
          eq(rateLimitLogs.ipHash, ip),
          eq(rateLimitLogs.action, action),
          lt(rateLimitLogs.createdAt, windowStart),
        )
      );

      // Find oldest entry and count within the window
      const rows = await db
        .select({ createdAt: rateLimitLogs.createdAt })
        .from(rateLimitLogs)
        .where(
          and(
            eq(rateLimitLogs.ipHash, ip),
            eq(rateLimitLogs.action, action),
            gte(rateLimitLogs.createdAt, windowStart),
          )
        );

      if (rows.length >= MAX_REQUESTS) {
        // Real remaining time: oldest entry expires at createdAt + WINDOW_MS
        const oldestTs = rows.reduce((min, r) => {
          const t = r.createdAt instanceof Date ? r.createdAt.getTime() : new Date(r.createdAt as string).getTime();
          return t < min ? t : min;
        }, Date.now());
        const retryAfter = Math.max(1, Math.ceil((oldestTs + WINDOW_MS - Date.now()) / 1000));
        return { allowed: false, retryAfter };
      }

      await db.insert(rateLimitLogs).values({ ipHash: ip, action, createdAt: now });
      return { allowed: true, retryAfter: 0 };
    } catch {
      // Fallback: in-memory store when DB is unavailable
      const entry = memoryStore.get(key);
      if (!entry || Date.now() > entry.resetTime) {
        memoryStore.set(key, { count: 1, resetTime: Date.now() + WINDOW_MS });
        return { allowed: true, retryAfter: 0 };
      }
      if (entry.count >= MAX_REQUESTS) {
        return { allowed: false, retryAfter: Math.ceil((entry.resetTime - Date.now()) / 1000) };
      }
      entry.count += 1;
      return { allowed: true, retryAfter: 0 };
    }
  }

  /** Clear all rate-limit records for a given IP and optional action (admin use). */
  export async function clearRateLimit(ip: string, action?: string): Promise<void> {
    try {
      const db = getDb();
      if (action) {
        await db.delete(rateLimitLogs).where(
          and(eq(rateLimitLogs.ipHash, ip), eq(rateLimitLogs.action, action))
        );
      } else {
        await db.delete(rateLimitLogs).where(eq(rateLimitLogs.ipHash, ip));
      }
    } catch {
      // best-effort — never let this crash the server
    }
  }

  // Clean up expired memory entries every hour
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (now > entry.resetTime) memoryStore.delete(key);
    }
  }, 60 * 60 * 1000);
  