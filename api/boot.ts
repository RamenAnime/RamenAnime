import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import mysql from "mysql2/promise";

const ALLOWED_COUNTRIES = ["US", "CA", "JP", "KR", "CN", "FR"];

// ─── Auto database migration on startup ───
async function runMigrations() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) { console.log("[migrate] No DATABASE_URL, skipping migrations"); return; }
  try {
    const conn = await mysql.createConnection(dbUrl);
    console.log("[migrate] Connected to database");

    // Add missing columns to users table
    const [cols] = await conn.execute("SHOW COLUMNS FROM users") as any;
    const names = cols.map((c: any) => c.Field);

    if (!names.includes("username")) {
      await conn.execute("ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE AFTER unionId");
      console.log("[migrate] Added username column");
    }
    if (!names.includes("password_hash")) {
      await conn.execute("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) AFTER username");
      console.log("[migrate] Added password_hash column");
    }
    if (!names.includes("auth_type")) {
      await conn.execute("ALTER TABLE users ADD COLUMN auth_type ENUM('oauth','local') DEFAULT 'oauth' NOT NULL AFTER password_hash");
      console.log("[migrate] Added auth_type column");
    }

    // Create password_reset_tokens table
    await conn.execute(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      userId BIGINT UNSIGNED NOT NULL UNIQUE,
      token VARCHAR(255) NOT NULL UNIQUE,
      expiresAt TIMESTAMP NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);
    console.log("[migrate] password_reset_tokens table ready");

    await conn.end();
    console.log("[migrate] All migrations complete");
  } catch (err: any) {
    console.error("[migrate] Error:", err.message);
  }
}

// Run migrations immediately on module load (before server starts)
runMigrations();

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

export default app;
