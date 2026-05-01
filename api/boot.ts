import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";

const ALLOWED_COUNTRIES = ["US", "CA", "JP", "KR", "CN", "FR"];
const BLOCKED_MESSAGE = JSON.stringify({
  error: "This service is only available in the United States, Canada, Japan, South Korea, China, and France.",
  code: "GEO_BLOCKED",
});

// ─── Auto database migration (runs in background, non-blocking) ───
async function runMigrations() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) { console.log("[migrate] No DATABASE_URL set"); return; }
  
  let conn: any = null;
  try {
    console.log("[migrate] Connecting to database for schema updates...");
    const mysql = await import("mysql2/promise");
    conn = await mysql.createConnection({
      uri: dbUrl,
      connectTimeout: 60000,
      ssl: { rejectUnauthorized: false }
    });
    console.log("[migrate] Database connected for DDL");

    // Add username column (nullable so existing rows are fine)
    try {
      await conn.query("ALTER TABLE users ADD COLUMN username VARCHAR(50) NULL");
      console.log("[migrate] Added username column");
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.includes("Duplicate") || msg.includes("already exists") || msg.includes("Exists") || msg.includes("Column") || msg.includes("column")) {
        console.log("[migrate] username column already exists or handled");
      } else {
        console.error("[migrate] username ALTER error:", msg);
      }
    }

    // Add password_hash column (nullable)
    try {
      await conn.query("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL");
      console.log("[migrate] Added password_hash column");
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.includes("Duplicate") || msg.includes("already exists") || msg.includes("Exists") || msg.includes("Column") || msg.includes("column")) {
        console.log("[migrate] password_hash column already exists or handled");
      } else {
        console.error("[migrate] password_hash ALTER error:", msg);
      }
    }

    // Add auth_type column (has default 'oauth', so NOT NULL is fine)
    try {
      await conn.query("ALTER TABLE users ADD COLUMN auth_type ENUM('oauth','local') DEFAULT 'oauth' NOT NULL");
      console.log("[migrate] Added auth_type column");
    } catch (e: any) {
      const msg = e.message || "";
      if (msg.includes("Duplicate") || msg.includes("already exists") || msg.includes("Exists") || msg.includes("Column") || msg.includes("column")) {
        console.log("[migrate] auth_type column already exists or handled");
      } else {
        console.error("[migrate] auth_type ALTER error:", msg);
      }
    }

    // Create password_reset_tokens table
    try {
      await conn.query(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED NOT NULL UNIQUE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expiresAt TIMESTAMP NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`);
      console.log("[migrate] password_reset_tokens table ready");
    } catch (e: any) {
      console.error("[migrate] password_reset_tokens error:", e.message);
    }

    await conn.end();
    console.log("[migrate] All migrations complete");
  } catch (err: any) {
    console.error("[migrate] Fatal connection error:", err.message);
    if (conn) {
      try { await conn.end(); } catch (_) { /* ignore */ }
    }
  }
}

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// ─── Geoblocking Middleware ───
app.use("/api/*", async (c, next) => {
  const path = c.req.path;
  if (path === "/api/ping" || path === Paths.oauthCallback || path.includes("geo.checkAccess")) {
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

app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.get("/api/ping", (c) => c.json({ ok: true, ts: Date.now() }));

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Run migrations in background after server starts (don't block startup)
setTimeout(runMigrations, 3000);

// ─── Production Server Startup ───
if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

export default app;
