import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

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

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);
  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
