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

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// ─── Geoblocking Middleware ───
app.use("/api/*", async (c, next) => {
  const path = c.req.path;
  if (path === "/api/ping" || path === Paths.oauthCallback || path.includes("geo.checkAccess") || path === "/api/run-migration") {
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

// ─── One-click database migration ───
app.get("/api/run-migration", async (c) => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return c.json({ error: "No DATABASE_URL" }, 500);

  let conn: any = null;
  const results: string[] = [];

  try {
    const mysql = await import("mysql2/promise");
    conn = await mysql.createConnection({
      uri: dbUrl,
      connectTimeout: 60000,
      ssl: { rejectUnauthorized: false }
    });

    // Step 1: add username
    try {
      await conn.query("ALTER TABLE users ADD COLUMN username VARCHAR(50) NULL");
      results.push("Added username column");
    } catch (e: any) {
      results.push("username: " + (e.message || "exists"));
    }

    // Step 2: add password_hash
    try {
      await conn.query("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL");
      results.push("Added password_hash column");
    } catch (e: any) {
      results.push("password_hash: " + (e.message || "exists"));
    }

    // Step 3: add auth_type
    try {
      await conn.query("ALTER TABLE users ADD COLUMN auth_type ENUM('oauth','local') DEFAULT 'oauth' NOT NULL");
      results.push("Added auth_type column");
    } catch (e: any) {
      results.push("auth_type: " + (e.message || "exists"));
    }

    // Step 4: create password_reset_tokens
    try {
      await conn.query(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED NOT NULL UNIQUE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expiresAt TIMESTAMP NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`);
      results.push("Created password_reset_tokens table");
    } catch (e: any) {
      results.push("password_reset_tokens: " + e.message);
    }

    await conn.end();
    return c.json({ success: true, results });
  } catch (err: any) {
    if (conn) {
      try { await conn.end(); } catch (_) { /* ignore */ }
    }
    return c.json({ success: false, error: err.message }, 500);
  }
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
