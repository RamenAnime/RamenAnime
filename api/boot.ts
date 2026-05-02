import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { getDb } from "./queries/connection";
import { sql } from "drizzle-orm";

const ALLOWED_COUNTRIES = [
  // North America
  "US", "CA",
  // Oceania
  "AU", "NZ",
  // Americas
  "MX", "BR",
  // EU (27 member states - IE removed)
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IT", "LV", "LT", "LU", "MT", "NL", "PL",
  "PT", "RO", "SK", "SI", "ES", "SE",
  // Asia (all)
  "AF", "AM", "AZ", "BH", "BD", "BT", "BN", "KH", "CN", "GE",
  "IN", "ID", "IR", "IQ", "IL", "JP", "JO", "KZ", "KW", "KG",
  "LA", "LB", "MY", "MV", "MN", "MM", "NP", "OM", "PK", "PH",
  "QA", "SA", "SG", "KR", "LK", "SY", "TW", "TJ", "TH", "TL",
  "TR", "TM", "AE", "UZ", "VN", "YE", "HK",
];
const BLOCKED_MESSAGE = JSON.stringify({
  error: "Service not available in your region.",
  code: "GEO_BLOCKED",
});

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Geoblocking Middleware
app.use("/api/*", async (c, next) => {
  // Skip geoblock for health checks and public country-check endpoint
  const path = c.req.path;
  if (path === "/api/ping" || path.includes("geo.checkAccess")) {
    return next();
  }
  const countryHeader = c.req.header("X-Country-Code");
  if (countryHeader) {
    const country = countryHeader.toUpperCase();
    if (!ALLOWED_COUNTRIES.includes(country)) {
      return c.json({ error: "GEO_BLOCKED", message: "Service not available in your country." }, 403);
    }
  }
  return next();
});

app.get("/api/ping", (c) => c.json({ ok: true, ts: Date.now() }));

// tRPC batch endpoint (POST /api/trpc)
app.use("/api/trpc", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// tRPC individual endpoint (GET/POST /api/trpc/*)
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.get("/api/run-migration", async (c) => {
  try {
    const db = getDb();
    // Create tax_rates table
    await db.execute(sql`CREATE TABLE IF NOT EXISTS tax_rates (
      id VARCHAR(128) PRIMARY KEY,
      country_code VARCHAR(2) NOT NULL,
      rate DECIMAL(5,2) NOT NULL,
      vat_name VARCHAR(50) DEFAULT 'VAT',
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      UNIQUE KEY (country_code)
    )`);
    // Create notifications table
    await db.execute(sql`CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT UNSIGNED NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      link VARCHAR(500),
      is_read BOOLEAN DEFAULT FALSE NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);
    // Add new columns to users if they don't exist (MySQL style)
    try {
      await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE NOT NULL`);
    } catch { /* already exists */ }
    try {
      await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE NOT NULL`);
    } catch { /* already exists */ }
    // Add indexes for performance
    try {
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    } catch { /* may already exist */ }
    try {
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(authorId)`);
    } catch { /* may already exist */ }
    try {
      await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId)`);
    } catch { /* may already exist */ }
    return c.json({ ok: true, message: "All tables and indexes created or already exist" });
  } catch (e) {
    return c.json({ ok: false, error: (e as Error).message }, 500);
  }
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);
  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

