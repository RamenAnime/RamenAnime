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

// ─── Full database migration ───
app.get("/api/run-migration", async (c) => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return c.json({ error: "No DATABASE_URL" }, 500);

  let conn: any = null;
  const results: string[] = [];

  try {
    const mysql = await import("mysql2/promise");
    conn = await mysql.createConnection({ uri: dbUrl, connectTimeout: 60000, ssl: { rejectUnauthorized: false } });
    results.push("Connected");

    // 1. Users table (with all auth columns)
    try {
      await conn.query(`CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        unionId VARCHAR(255) NULL UNIQUE,
        username VARCHAR(50) NULL UNIQUE,
        password_hash VARCHAR(255) NULL,
        auth_type ENUM('oauth','local') DEFAULT 'oauth' NOT NULL,
        name VARCHAR(255) NULL,
        email VARCHAR(320) NULL,
        avatar TEXT NULL,
        role ENUM('user','admin') DEFAULT 'user' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        lastSignInAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`);
      results.push("users table ready");
    } catch (e: any) { results.push("users: " + e.message); }

    // 2. User profiles
    try {
      await conn.query(`CREATE TABLE IF NOT EXISTS user_profiles (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED NOT NULL UNIQUE,
        display_name VARCHAR(100) NULL,
        headline VARCHAR(255) NULL,
        about_me TEXT NULL,
        interests TEXT NULL,
        favorite_anime TEXT NULL,
        favorite_games TEXT NULL,
        profile_song VARCHAR(500) NULL,
        profile_song_url VARCHAR(500) NULL,
        background_color VARCHAR(20) DEFAULT '#0a0a0a',
        background_image TEXT NULL,
        text_color VARCHAR(20) DEFAULT '#e5e5e5',
        accent_color VARCHAR(20) DEFAULT '#d4a853',
        mood VARCHAR(100) NULL,
        location VARCHAR(100) NULL,
        website VARCHAR(255) NULL,
        is_public TINYINT(1) DEFAULT 1 NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )`);
      results.push("user_profiles table ready");
    } catch (e: any) { results.push("user_profiles: " + e.message); }

    // 3. Forum posts
    try {
      await conn.query(`CREATE TABLE IF NOT EXISTS forum_posts (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        authorId BIGINT UNSIGNED NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general' NOT NULL,
        likes INT DEFAULT 0 NOT NULL,
        views INT DEFAULT 0 NOT NULL,
        is_pinned TINYINT(1) DEFAULT 0 NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )`);
      results.push("forum_posts table ready");
    } catch (e: any) { results.push("forum_posts: " + e.message); }

    // 4. Forum comments
    try {
      await conn.query(`CREATE TABLE IF NOT EXISTS forum_comments (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        postId BIGINT UNSIGNED NOT NULL,
        authorId BIGINT UNSIGNED NOT NULL,
        content TEXT NOT NULL,
        likes INT DEFAULT 0 NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )`);
      results.push("forum_comments table ready");
    } catch (e: any) { results.push("forum_comments: " + e.message); }

    // 5. Friends
    try {
      await conn.query(`CREATE TABLE IF NOT EXISTS friends (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        requesterId BIGINT UNSIGNED NOT NULL,
        addresseeId BIGINT UNSIGNED NOT NULL,
        status ENUM('pending','accepted','declined','blocked') DEFAULT 'pending' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )`);
      results.push("friends table ready");
    } catch (e: any) { results.push("friends: " + e.message); }

    // 6. TOS acceptances
    try {
      await conn.query(`CREATE TABLE IF NOT EXISTS tos_acceptances (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED NOT NULL UNIQUE,
        version VARCHAR(20) NOT NULL,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`);
      results.push("tos_acceptances table ready");
    } catch (e: any) { results.push("tos_acceptances: " + e.message); }

    // 7. Marketplace listings
    try {
      await conn.query(`CREATE TABLE IF NOT EXISTS marketplace_listings (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        sellerId BIGINT UNSIGNED NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price VARCHAR(50) NOT NULL,
        condition ENUM('new','used','like_new') DEFAULT 'new' NOT NULL,
        category VARCHAR(50) DEFAULT 'general' NOT NULL,
        images TEXT NULL,
        contact_method VARCHAR(255) NULL,
        is_active TINYINT(1) DEFAULT 1 NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )`);
      results.push("marketplace_listings table ready");
    } catch (e: any) { results.push("marketplace_listings: " + e.message); }

    // 8. Geo verifications
    try {
      await conn.query(`CREATE TABLE IF NOT EXISTS geo_verifications (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED NOT NULL UNIQUE,
        country_code VARCHAR(10) NOT NULL,
        country_name VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45) NULL,
        age_verified TINYINT(1) DEFAULT 0 NOT NULL,
        id_verified TINYINT(1) DEFAULT 0 NOT NULL,
        selfie_verified TINYINT(1) DEFAULT 0 NOT NULL,
        blocked TINYINT(1) DEFAULT 0 NOT NULL,
        block_reason TEXT NULL,
        verifiedAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )`);
      results.push("geo_verifications table ready");
    } catch (e: any) { results.push("geo_verifications: " + e.message); }

    // 9. ID verifications
    try {
      await conn.query(`CREATE TABLE IF NOT EXISTS id_verifications (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED NOT NULL UNIQUE,
        id_document_url TEXT NULL,
        selfie_url TEXT NULL,
        id_number_hash VARCHAR(255) NULL,
        full_name VARCHAR(255) NULL,
        date_of_birth VARCHAR(20) NULL,
        status ENUM('pending','approved','rejected','needs_review') DEFAULT 'pending' NOT NULL,
        rejection_reason TEXT NULL,
        reviewed_by BIGINT UNSIGNED NULL,
        reviewedAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )`);
      results.push("id_verifications table ready");
    } catch (e: any) { results.push("id_verifications: " + e.message); }

    // 10. Donations
    try {
      await conn.query(`CREATE TABLE IF NOT EXISTS donations (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        donor_name VARCHAR(255) NULL,
        donor_email VARCHAR(320) NULL,
        amount VARCHAR(50) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
        country_code VARCHAR(10) NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_status ENUM('pending','completed','failed','refunded') DEFAULT 'pending' NOT NULL,
        transaction_id VARCHAR(255) NULL,
        message TEXT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`);
      results.push("donations table ready");
    } catch (e: any) { results.push("donations: " + e.message); }

    // 11. Password reset tokens
    try {
      await conn.query(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        userId BIGINT UNSIGNED NOT NULL UNIQUE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expiresAt TIMESTAMP NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`);
      results.push("password_reset_tokens table ready");
    } catch (e: any) { results.push("password_reset_tokens: " + e.message); }

    await conn.end();
    return c.json({ success: true, results });
  } catch (err: any) {
    if (conn) { try { await conn.end(); } catch (_) { /* ignore */ } }
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.get("/api/ping", (c) => c.json({ ok: true, ts: Date.now() }));

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({ endpoint: "/api/trpc", req: c.req.raw, router: appRouter, createContext });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

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
