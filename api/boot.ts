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

// ─── Auto database migration (runs in background, doesn't block server start) ───
async function runMigrations() {
  try {
    // Use dynamic import so schema modules load first
    const { getDb } = await import("./queries/connection");
    const db = getDb();
    console.log("[migrate] Database connected");

    // Check and add missing columns to users table
    const columnsResult = await db.execute("SHOW COLUMNS FROM users");
    const cols = Array.isArray(columnsResult) ? columnsResult[0] : columnsResult;
    const names = cols.map((c: any) => c.Field);

    if (!names.includes("username")) {
      await db.execute("ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE AFTER unionId");
      console.log("[migrate] Added username column");
    }
    if (!names.includes("password_hash")) {
      await db.execute("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) AFTER username");
      console.log("[migrate] Added password_hash column");
    }
    if (!names.includes("auth_type")) {
      await db.execute("ALTER TABLE users ADD COLUMN auth_type ENUM('oauth','local') DEFAULT 'oauth' NOT NULL AFTER password_hash");
      console.log("[migrate] Added auth_type column");
    }

    // Create password_reset_tokens table
    await db.execute(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      userId BIGINT UNSIGNED NOT NULL UNIQUE,
      token VARCHAR(255) NOT NULL UNIQUE,
      expiresAt TIMESTAMP NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);
    console.log("[migrate] password_reset_tokens table ready");
    console.log("[migrate] All migrations complete");
  } catch (err: any) {
    console.error("[migrate] Error:", err.message);
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

// Start migrations in the background after a short delay (let server start first)
setTimeout(runMigrations, 2000);

export default app;
