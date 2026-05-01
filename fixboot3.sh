#!/bin/bash
set -e

echo "Fixing boot.ts: adding back server startup code..."

cat << 'BOOTEEOF' > api/boot.ts
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

// ─── Auto database migration (runs in background) ───
async function runMigrations() {
  try {
    const { getDb } = await import("./queries/connection");
    const db = getDb();
    console.log("[migrate] Database connected");

    try {
      await db.execute("ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE AFTER unionId");
      console.log("[migrate] Added username column");
    } catch (e: any) {
      if (e.message?.includes("Duplicate") || e.message?.includes("already exists")) {
        console.log("[migrate] username column already exists");
      } else { console.error("[migrate] username error:", e.message); }
    }

    try {
      await db.execute("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) AFTER username");
      console.log("[migrate] Added password_hash column");
    } catch (e: any) {
      if (e.message?.includes("Duplicate") || e.message?.includes("already exists")) {
        console.log("[migrate] password_hash column already exists");
      } else { console.error("[migrate] password_hash error:", e.message); }
    }

    try {
      await db.execute("ALTER TABLE users ADD COLUMN auth_type ENUM('oauth','local') DEFAULT 'oauth' NOT NULL AFTER password_hash");
      console.log("[migrate] Added auth_type column");
    } catch (e: any) {
      if (e.message?.includes("Duplicate") || e.message?.includes("already exists")) {
        console.log("[migrate] auth_type column already exists");
      } else { console.error("[migrate] auth_type error:", e.message); }
    }

    try {
      await db.execute(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
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

    console.log("[migrate] All migrations complete");
  } catch (err: any) {
    console.error("[migrate] Fatal error:", err.message);
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

// Start migrations in background after server starts
setTimeout(runMigrations, 2000);

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
BOOTEEOF

echo "Done. Committing and pushing..."
git add api/boot.ts
git commit -m "fix: add back server startup code, keep background migrations" && git push origin main || echo "Push failed"

echo ""
echo "Now deploy on Render:"
echo "  Manual Deploy > Clear Build Cache & Deploy"
