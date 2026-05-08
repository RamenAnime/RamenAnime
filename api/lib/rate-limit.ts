// Hybrid rate limiter: database-backed (primary) with in-memory fallback.
  // Database persistence ensures limits hold across server restarts and multiple instances.

  import { getDb } from "../queries/connection";
  import { rateLimitLogs } from "@db/schema";
  import { eq, and, gte, lt, count } from "drizzle-orm";

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

      // Delete entries that are OLDER than the window (expired records)
      await db.delete(rateLimitLogs).where(
        and(
          eq(rateLimitLogs.ipHash, ip),
          eq(rateLimitLogs.action, action),
          lt(rateLimitLogs.createdAt, windowStart),
        )
      );

      // Count attempts that fall WITHIN the window
      const [result] = await db
        .select({ count: count() })
        .from(rateLimitLogs)
        .where(
          and(
            eq(rateLimitLogs.ipHash, ip),
            eq(rateLimitLogs.action, action),
            gte(rateLimitLogs.createdAt, windowStart),
          )
        );

      const requestCount = result?.count ?? 0;

      if (requestCount >= MAX_REQUESTS) {
        return { allowed: false, retryAfter: Math.ceil(WINDOW_MS / 1000) };
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

  // Clean up expired memory entries every hour
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (now > entry.resetTime) memoryStore.delete(key);
    }
  }, 60 * 60 * 1000);
  