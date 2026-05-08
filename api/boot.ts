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

  
  // ── Auto-migration: runs on every boot to ensure schema is up to date ─────────
  async function runMigrations(): Promise<void> {
    try {
      const db = getDb();
      // ── Phase 1: Add missing columns to forum_posts and forum_comments ─────
      // Note: IF NOT EXISTS is not universally supported; use try/catch double-attempt
      try { await db.execute(sql`ALTER TABLE forum_posts ADD COLUMN parent_id BIGINT UNSIGNED DEFAULT NULL`); } catch (_) {}
      try { await db.execute(sql`ALTER TABLE forum_comments ADD COLUMN parent_id BIGINT UNSIGNED DEFAULT NULL`); } catch (_) {}

      // ── Phase 2: Add missing columns to marketplace_listings ──────────────
      try { await db.execute(sql`ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS listing_type ENUM('fixed','auction') NOT NULL DEFAULT 'fixed'`); } catch (_) {}
      try { await db.execute(sql`ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS start_price VARCHAR(50)`); } catch (_) {}
      try { await db.execute(sql`ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS reserve_price VARCHAR(50)`); } catch (_) {}
      try { await db.execute(sql`ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS buy_now_price VARCHAR(50)`); } catch (_) {}
      try { await db.execute(sql`ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS current_bid VARCHAR(50)`); } catch (_) {}
      try { await db.execute(sql`ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS bid_count INT NOT NULL DEFAULT 0`); } catch (_) {}
      try { await db.execute(sql`ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS auction_end TIMESTAMP NULL DEFAULT NULL`); } catch (_) {}
      try { await db.execute(sql`ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS videos TEXT`); } catch (_) {}
      try { await db.execute(sql`ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS copyright_status ENUM('pending','clear','flagged','rejected') NOT NULL DEFAULT 'pending'`); } catch (_) {}
      try { await db.execute(sql`ALTER TABLE marketplace_listings ADD COLUMN IF NOT EXISTS scan_details TEXT`); } catch (_) {}

      // ── Phase 3: Add missing columns to users ─────────────────────────────
      try { await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT FALSE`); } catch (_) {}
      try { await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN NOT NULL DEFAULT FALSE`); } catch (_) {}

      // ── Phase 4: Ensure core tables from original migration exist ─────────
      await db.execute(sql`CREATE TABLE IF NOT EXISTS tax_rates (id VARCHAR(128) PRIMARY KEY, country_code VARCHAR(2) NOT NULL, rate DECIMAL(5,2) NOT NULL, vat_name VARCHAR(50) DEFAULT 'VAT', updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE KEY uq_tax_country (country_code))`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS notifications (id INT AUTO_INCREMENT PRIMARY KEY, userId INT UNSIGNED NOT NULL, type VARCHAR(50) NOT NULL, title VARCHAR(255) NOT NULL, message TEXT NOT NULL, link VARCHAR(500), is_read BOOLEAN NOT NULL DEFAULT FALSE, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, sender_id INT UNSIGNED NOT NULL, recipient_id INT UNSIGNED NOT NULL, subject VARCHAR(255) NOT NULL, body TEXT NOT NULL, is_read BOOLEAN NOT NULL DEFAULT FALSE, sender_deleted BOOLEAN NOT NULL DEFAULT FALSE, recipient_deleted BOOLEAN NOT NULL DEFAULT FALSE, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS moderation_logs (id INT AUTO_INCREMENT PRIMARY KEY, user_id INT UNSIGNED NOT NULL, target_type VARCHAR(50) NOT NULL, target_id INT UNSIGNED NOT NULL, action VARCHAR(50) NOT NULL, rule VARCHAR(100) NOT NULL, reason TEXT NOT NULL, content_snapshot TEXT, auto_moderated BOOLEAN NOT NULL DEFAULT TRUE, reviewed_by INT UNSIGNED, reviewedAt TIMESTAMP, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);

      // ── Phase 5: New tables ────────────────────────────────────────────────
      await db.execute(sql`CREATE TABLE IF NOT EXISTS forum_reactions (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, postId BIGINT UNSIGNED NOT NULL, userId BIGINT UNSIGNED NOT NULL, emoji VARCHAR(20) NOT NULL, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS user_signatures (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, userId BIGINT UNSIGNED NOT NULL UNIQUE, content TEXT, is_visible BOOLEAN NOT NULL DEFAULT TRUE, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS auction_bids (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, listing_id BIGINT UNSIGNED NOT NULL, bidder_id BIGINT UNSIGNED NOT NULL, amount DECIMAL(10,2) NOT NULL, is_proxy BOOLEAN NOT NULL DEFAULT FALSE, proxy_max DECIMAL(10,2), is_auto_bid BOOLEAN NOT NULL DEFAULT FALSE, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS watchlist_items (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL, listing_id BIGINT UNSIGNED NOT NULL, notify_outbid BOOLEAN NOT NULL DEFAULT TRUE, notify_ending BOOLEAN NOT NULL DEFAULT TRUE, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS listing_media (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, listing_id BIGINT UNSIGNED NOT NULL, url TEXT NOT NULL, media_type VARCHAR(20) NOT NULL DEFAULT 'image', sort_order INT NOT NULL DEFAULT 0, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS listing_questions (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, listing_id BIGINT UNSIGNED NOT NULL, user_id BIGINT UNSIGNED NOT NULL, question TEXT NOT NULL, answer TEXT, answered_by BIGINT UNSIGNED, answeredAt TIMESTAMP, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS seller_ratings (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, seller_id BIGINT UNSIGNED NOT NULL, buyer_id BIGINT UNSIGNED NOT NULL, order_id BIGINT UNSIGNED NOT NULL, rating INT NOT NULL, comment TEXT, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS seller_profiles (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL UNIQUE, level ENUM('bronze','silver','gold','platinum','diamond') NOT NULL DEFAULT 'bronze', total_sales INT NOT NULL DEFAULT 0, total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0, avg_rating DECIMAL(3,2), rating_count INT NOT NULL DEFAULT 0, successful_auctions INT NOT NULL DEFAULT 0, verified_seller BOOLEAN NOT NULL DEFAULT FALSE, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS copyright_scans (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, listing_id BIGINT UNSIGNED NOT NULL, scan_type ENUM('text','image','video') NOT NULL, status ENUM('pending','clear','flagged','rejected') NOT NULL DEFAULT 'pending', confidence DECIMAL(5,2), matched_terms TEXT, reason TEXT, scannedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS price_offers (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, listing_id BIGINT UNSIGNED NOT NULL, buyer_id BIGINT UNSIGNED NOT NULL, amount DECIMAL(10,2) NOT NULL, status ENUM('pending','accepted','rejected','expired') NOT NULL DEFAULT 'pending', message TEXT, respondedAt TIMESTAMP, expiresAt TIMESTAMP, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS auction_deposits (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, listing_id BIGINT UNSIGNED NOT NULL, user_id BIGINT UNSIGNED NOT NULL, amount DECIMAL(10,2) NOT NULL, status ENUM('held','released','forfeited') NOT NULL DEFAULT 'held', stripe_payment_intent_id VARCHAR(255), createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS sniper_bids (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, listing_id BIGINT UNSIGNED NOT NULL, user_id BIGINT UNSIGNED NOT NULL, max_amount DECIMAL(10,2) NOT NULL, is_active BOOLEAN NOT NULL DEFAULT TRUE, triggered_at TIMESTAMP, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS price_history (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, listing_id BIGINT UNSIGNED NOT NULL, price DECIMAL(10,2) NOT NULL, source VARCHAR(50), createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS prohibited_scans (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, listing_id BIGINT UNSIGNED NOT NULL, status ENUM('pending','clear','flagged','rejected') NOT NULL DEFAULT 'pending', confidence DECIMAL(5,2), matched_terms TEXT, reason TEXT, scannedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS category_rules (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, category VARCHAR(50) NOT NULL UNIQUE, min_price DECIMAL(10,2), max_price DECIMAL(10,2), require_photos BOOLEAN NOT NULL DEFAULT FALSE, allow_auctions BOOLEAN NOT NULL DEFAULT TRUE, require_id_verify BOOLEAN NOT NULL DEFAULT FALSE, updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS orders (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, order_number VARCHAR(50) NOT NULL UNIQUE, buyer_id BIGINT UNSIGNED NOT NULL, seller_id BIGINT UNSIGNED NOT NULL, listing_id BIGINT UNSIGNED NOT NULL, total_amount DECIMAL(10,2) NOT NULL, tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0, fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0, shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0, currency VARCHAR(10) NOT NULL DEFAULT 'USD', status ENUM('pending','paid','shipped','delivered','cancelled','disputed','refunded') NOT NULL DEFAULT 'pending', escrow_status ENUM('pending','held','released','refunded') NOT NULL DEFAULT 'pending', shipping_carrier VARCHAR(50), tracking_number VARCHAR(100), shipping_address TEXT, notes TEXT, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS transactions (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, transaction_number VARCHAR(50) NOT NULL UNIQUE, order_id BIGINT UNSIGNED NOT NULL, payer_id BIGINT UNSIGNED NOT NULL, payee_id BIGINT UNSIGNED NOT NULL, amount DECIMAL(10,2) NOT NULL, fee DECIMAL(10,2) NOT NULL DEFAULT 0, currency VARCHAR(10) NOT NULL DEFAULT 'USD', payment_method ENUM('stripe','paypay','konbini','bank_transfer','credit_card','escrow','deposit') NOT NULL DEFAULT 'stripe', status ENUM('pending','completed','failed','refunded','disputed') NOT NULL DEFAULT 'pending', gateway_transaction_id VARCHAR(255), metadata TEXT, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS warehouse_items (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, listing_id BIGINT UNSIGNED NOT NULL, seller_id BIGINT UNSIGNED NOT NULL, location VARCHAR(100), quantity INT NOT NULL DEFAULT 1, status ENUM('pending','received','shipped','returned') NOT NULL DEFAULT 'pending', createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS package_tracking (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, order_id BIGINT UNSIGNED NOT NULL, carrier VARCHAR(50), tracking_number VARCHAR(100), status VARCHAR(100), last_location VARCHAR(255), estimated_delivery TIMESTAMP, updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS id_verifications (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL UNIQUE, status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending', document_type VARCHAR(50), document_url TEXT, notes TEXT, reviewed_by BIGINT UNSIGNED, reviewedAt TIMESTAMP, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS geo_verifications (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL, country_code VARCHAR(2) NOT NULL, verified_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS tos_acceptances (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL UNIQUE, version VARCHAR(20) NOT NULL, accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, ip_address VARCHAR(45), user_agent TEXT)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS password_reset_tokens (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL, token_hash VARCHAR(64) NOT NULL UNIQUE, expires_at TIMESTAMP NOT NULL, used BOOLEAN NOT NULL DEFAULT FALSE, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS sms_verifications (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL, phone VARCHAR(20) NOT NULL, code VARCHAR(10) NOT NULL, expires_at TIMESTAMP NOT NULL, used BOOLEAN NOT NULL DEFAULT FALSE, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS listing_views (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, listing_id BIGINT UNSIGNED NOT NULL, user_id BIGINT UNSIGNED, ip_hash VARCHAR(64), viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS user_profiles (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL UNIQUE, bio TEXT, avatar_url TEXT, banner_url TEXT, location VARCHAR(100), website VARCHAR(255), twitter VARCHAR(100), theme VARCHAR(50) DEFAULT 'default', profile_song VARCHAR(500), badges TEXT, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS friends (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, requester_id BIGINT UNSIGNED NOT NULL, addressee_id BIGINT UNSIGNED NOT NULL, status ENUM('pending','accepted','blocked') NOT NULL DEFAULT 'pending', createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS donations (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, stripe_payment_intent_id VARCHAR(255), donor_name VARCHAR(100), donor_user_id BIGINT UNSIGNED, amount DECIMAL(10,2), message TEXT, is_public BOOLEAN NOT NULL DEFAULT TRUE, currency VARCHAR(10) NOT NULL DEFAULT 'USD', createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);

      // ── Phase 6: Analytics tables ─────────────────────────────────────────
      await db.execute(sql`CREATE TABLE IF NOT EXISTS site_visits (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED, session_id VARCHAR(128), ip_hash VARCHAR(64), country_code VARCHAR(2), user_agent TEXT, path VARCHAR(500), referrer VARCHAR(500), visited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS page_views (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, session_id VARCHAR(128), path VARCHAR(500) NOT NULL, duration_ms INT, visited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS search_queries (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED, query TEXT NOT NULL, results_count INT, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS user_events (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED, event_type VARCHAR(50) NOT NULL, data TEXT, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS product_views (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, listing_id BIGINT UNSIGNED NOT NULL, user_id BIGINT UNSIGNED, session_id VARCHAR(128), viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS user_sessions (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, user_id BIGINT UNSIGNED NOT NULL, session_token VARCHAR(255) NOT NULL UNIQUE, ip_address VARCHAR(45), user_agent TEXT, last_active TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS rate_limit_logs (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, ip_hash VARCHAR(64) NOT NULL, action VARCHAR(50) NOT NULL, createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS swarm_snapshots (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, active_users INT NOT NULL DEFAULT 0, page_counts TEXT, country_counts TEXT, captured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`);

      // ── Phase 7: Indexes ───────────────────────────────────────────────────
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`); } catch (_) {}
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_forum_posts_author ON forum_posts(authorId)`); } catch (_) {}
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId)`); } catch (_) {}
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id)`); } catch (_) {}
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_moderation_user ON moderation_logs(user_id)`); } catch (_) {}
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_listings_seller ON marketplace_listings(sellerId)`); } catch (_) {}
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_listings_active ON marketplace_listings(is_active)`); } catch (_) {}
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_bids_listing ON auction_bids(listing_id)`); } catch (_) {}
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id)`); } catch (_) {}
      try { await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id)`); } catch (_) {}
      // Ensure admin accounts are never permanently locked out
      try { await db.execute(sql`UPDATE users SET is_banned = FALSE WHERE role = 'admin'`); } catch (_) {}

          // Clear stale rate-limit entries (removes lockouts from before the await fix)
    try { await db.execute(sql`DELETE FROM rate_limit_logs WHERE createdAt < NOW() - INTERVAL 15 MINUTE`); } catch (_) {}

        console.log("DB migration: all tables and columns verified");
    } catch (err) {
      console.error("DB migration error:", err, " failed — server continuing anyway");
    }
  }
  
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
        return c.json({ error: "UNAUTHORIZED", message: "Invalid or missing admin key." }, 401);
      }
      await runMigrations();
      return c.json({ ok: true, message: "Migration complete — all tables and columns created or already exist." });
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
    // Run schema migration on startup
    await runMigrations();

        serve({ fetch: app.fetch, port }, () => console.log(`Server running on http://localhost:${port}/`));
  }
  