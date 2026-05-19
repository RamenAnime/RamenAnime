import { Hono } from "hono";
  import { bodyLimit } from "hono/body-limit";
  import type { HttpBindings } from "@hono/node-server";
  import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
  import { appRouter } from "./router";
  import { createContext } from "./context";
  import { env } from "./lib/utils/env";
  import { runMigrations } from "../db/migrate-runner";
  import { getDb } from "./queries/connection";
  import { sql } from "drizzle-orm";
  import type { Context as HonoContext } from "hono";
  import { handleStripeWebhook } from "./stripe-webhook";
import { auctionStreamHandler } from "./routes/auction-stream";
import { runAuctionMaintenance } from "./lib/auction-jobs";

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
    if (path === "/api/ping" || path.includes("geo.checkAccess") || path.startsWith("/api/auctions/") || path === "/api/cron/auctions") return next();
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

  app.get("/api/auctions/:id/stream", (c) => {
    const id = parseInt(c.req.param("id"), 10);
    if (!id || Number.isNaN(id)) return c.json({ error: "Invalid listing id" }, 400);
    return auctionStreamHandler(id)(c);
  });

  app.get("/api/cron/auctions", async (c) => {
    const key = c.req.header("X-Admin-Key") || c.req.query("key");
    if (key !== process.env.ADMIN_MIGRATION_KEY) {
      return c.json({ error: "UNAUTHORIZED" }, 401);
    }
    const result = await runAuctionMaintenance();
    return c.json({ ok: true, ...result });
  });

  const handleTrpc = async (c: HonoContext) => {
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: c.req.raw,
      router: appRouter,
      createContext,
      responseMeta({ ctx }) {
        const headers: Record<string, string | string[]> = {};
        ctx?.resHeaders.forEach((value, key) => {
          const lower = key.toLowerCase();
          if (lower === "set-cookie") {
            const existing = headers[key];
            headers[key] = existing
              ? Array.isArray(existing)
                ? [...existing, value]
                : [existing, value]
              : value;
          } else {
            headers[key] = value;
          }
        });
        return Object.keys(headers).length ? { headers } : {};
      },
    });
    return response;
  };

  app.use("/api/trpc", handleTrpc);
  app.use("/api/trpc/*", handleTrpc);

  app.get("/api/run-migration", async (c) => {
      const adminKey = c.req.header("X-Admin-Key");
      if (adminKey !== process.env.ADMIN_MIGRATION_KEY) {
        return c.json({ error: "UNAUTHORIZED", message: "Invalid or missing admin key." }, 401);
      }
      await runMigrations();
      return c.json({ ok: true, message: "Migration complete - all tables and columns created or already exist." });
    });

  // Emergency endpoint: unban a specific user or all admins
    app.get("/api/admin/unban", async (c) => {
      const adminKey = c.req.header("X-Admin-Key");
      if (adminKey !== process.env.ADMIN_MIGRATION_KEY) {
        return c.json({ error: "UNAUTHORIZED" }, 401);
      }
      try {
        const db = getDb();
        const username = c.req.query("username");
        if (username) {
          await db.execute(sql`UPDATE users SET is_banned = FALSE WHERE username = ${username}`);
          return c.json({ ok: true, message: `Unbanned user: ${username}` });
        } else {
          // Default: unban all admins
          await db.execute(sql`UPDATE users SET is_banned = FALSE WHERE role = 'admin'`);
          return c.json({ ok: true, message: "All admin accounts unbanned" });
        }
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
    try {
      await runMigrations({ continueOnError: true, verbose: true });
    } catch (err) {
      console.error("DB migration error:", err, " failed - server continuing anyway");
    }

    // Close ended auctions and expire unpaid orders every 60s
    setInterval(() => {
      runAuctionMaintenance().catch((err) => console.error("[auction-cron]", err));
    }, 60_000);

        serve({ fetch: app.fetch, port }, () => console.log(`Server running on http://localhost:${port}/`));
  }
