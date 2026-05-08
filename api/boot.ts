import { Hono } from "hono";
  import { bodyLimit } from "hono/body-limit";
  import type { HttpBindings } from "@hono/node-server";
  import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
  import { appRouter } from "./router";
  import { createContext } from "./context";
  import { env } from "./lib/utils/env";
  import { getDb } from "./queries/connection";
  import { sql } from "drizzle-orm";
  import type { Context as HonoContext } from "hono";
  import { handleStripeWebhook } from "./stripe-webhook";

  // OFAC and internationally sanctioned countries blocked at the server level
  const BLOCKED_COUNTRIES = ["IR", "KP", "SY", "CU", "MM"];

  const app = new Hono<{ Bindings: HttpBindings }>();
  app.use(bodyLimit({ maxSize: 10 * 1024 * 1024 })); // 10 MB max upload

  app.use("*", async (c, next) => {
    await next();
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("X-XSS-Protection", "1; mode=block");
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
    c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
    c.header("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  });

  // Only trust Cloudflare-injected headers to prevent IP spoofing
  function getClientCountry(c: HonoContext): { country: string; source: string; ip: string } {
    const cfCountry = c.req.header("CF-IPCountry");
    const cfIP = c.req.header("CF-Connecting-IP");
    const xCountryCode = c.req.header("X-Country-Code");
    let ip = "unknown";
    if (cfIP) ip = cfIP;
    if (cfCountry && cfCountry !== "XX") return { country: cfCountry.toUpperCase(), source: "cloudflare", ip };
    if (xCountryCode) return { country: xCountryCode.toUpperCase(), source: "header", ip };
    return { country: "", source: "unknown", ip };
  }

  app.use("/api/*", async (c, next) => {
    const path = c.req.path;
    if (path === "/api/ping" || path.includes("geo.checkAccess")) return next();
    const geo = getClientCountry(c);
    if (geo.country && BLOCKED_COUNTRIES.includes(geo.country)) {
      return c.json({
        error: "GEO_BLOCKED",
        code: "GEO_BLOCKED",
        message: "Service not available in your country.",
        country: geo.country,
        source: geo.source,
      }, 403);
    }
    return next();
  });

  app.use("/api/*", async (c, next) => {
    await next();
    const geo = getClientCountry(c);
    if (geo.country) {
      c.header("X-Detected-Country", geo.country);
      c.header("X-Geo-Source", geo.source);
    }
  });

  app.get("/api/ping", (c) => c.json({ ok: true, ts: Date.now() }));

  // Stripe webhook must be mounted BEFORE tRPC so it receives the raw request body
  app.post("/api/stripe/webhook", handleStripeWebhook);

  app.use("/api/trpc", async (c) =>
    fetchRequestHandler({ endpoint: "/api/trpc", req: c.req.raw, router: appRouter, createContext })
  );
  app.use("/api/trpc/*", async (c) =>
    fetchRequestHandler({ endpoint: "/api/trpc", req: c.req.raw, router: appRouter, createContext })
  );

  app.get("/api/run-migration", async (c) => {
    const adminKey = c.req.header("X-Admin-Key");
    if (adminKey !== process.env.ADMIN_MIGRATION_KEY) {
      return c.json({ error: "UNAUTHORIZED", message: "Invalid or missing admin key. Set ADMIN_MIGRATION_KEY env var." }, 401);
    }
    try {
      const db = getDb();
      await db.execute(sql`CREATE TABLE IF NOT EXISTS tax_rates (id VARCHAR(128) PRIMARY KEY, country_code VARCHAR(2) NOT NULL, rate DECIMAL(5,2) NOT NULL, vat_name VARCHAR(50) DEFAULT 'VAT', updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE KEY (country_code))`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS notifications (id INT AUTO_INCREMENT PRIMARY KEY, userId INT UNSIGNED NOT NULL, type VARCHAR(50) NOT NULL, title VARCHAR(255) NOT NULL, message TEXT NOT NULL, link VARCHAR(500), is_read BOOLEAN DEFAULT FALSE NOT NULL, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)`);
      try { await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE NOT NULL`); } catch {}
      try { await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE NOT NULL`); } catch {}
      await db.execute(sql`CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, sender_id INT UNSIGNED NOT NULL, recipient_id INT UNSIGNED NOT NULL, subject VARCHAR(255) NOT NULL, body TEXT NOT NULL, is_read BOOLEAN DEFAULT FALSE NOT NULL, sender_deleted BOOLEAN DEFAULT FALSE NOT NULL, recipient_deleted BOOLEAN DEFAULT FALSE NOT NULL, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS moderation_logs (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT UNSIGNED NOT NULL, target_type VARCHAR(50) NOT NULL, target_id INT UNSIGNED NOT NULL, action VARCHAR(50) NOT NULL, rule VARCHAR(100) NOT NULL, reason TEXT NOT NULL, content_snapshot TEXT, auto_moderated BOOLEAN DEFAULT TRUE NOT NULL, reviewed_by INT UNSIGNED, reviewedAt TIMESTAMP, createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)`);
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`); } catch {}
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(authorId)`); } catch {}
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId)`); } catch {}
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id)`); } catch {}
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_moderation_user ON moderation_logs(user_id)`); } catch {}
      return c.json({ ok: true, message: "All tables and indexes created or already exist" });
    } catch (e) {
      return c.json({ ok: false, error: (e as Error).message }, 500);
    }
  });

  app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

  export default app;

  if (env.isProduction) {
    const { serve } = await import("@hono/node-server");
    const { serveStaticFiles } = await import("./lib/utils/vite");
    serveStaticFiles(app);
    const port = parseInt(process.env.PORT || "3000");
    serve({ fetch: app.fetch, port }, () => console.log(`Server running on http://localhost:${port}/`));
  }
  