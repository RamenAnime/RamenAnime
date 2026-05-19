<p align="center">
    <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS 4" />
    <img src="https://img.shields.io/badge/tRPC-11-2596BE?logo=trpc" alt="tRPC 11" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite 6" />
    <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F" alt="Drizzle ORM" />
    <img src="https://img.shields.io/badge/Hono-server-orange" alt="Hono" />
  </p>

  <h1 align="center">ラーメンアニメ (Ramen Anime)</h1>

  <p align="center">
    <strong>A global anime merchandise marketplace - live auctions, fraud detection, and support for 35 languages.</strong>
  </p>

  <p align="center">
    <a href="https://ramenanime.com">Live Site</a> ·
    <a href="https://github.com/RamenAnime/RamenAnime-Portfolio">Public Portfolio (for employers)</a> ·
    <a href="#getting-started">Getting Started</a> ·
    <a href="#architecture">Architecture</a> ·
    <a href="#environment-variables">Environment Variables</a> ·
    <a href="#deployment">Deployment</a>
  </p>

  <p align="center">
    <sub>Recruiters: if this repository is private, use the <a href="https://github.com/RamenAnime/RamenAnime-Portfolio">RamenAnime-Portfolio</a> repo for architecture and feature documentation.</sub>
  </p>

  ---

  ## What is Ramen Anime?

  Ramen Anime is a production-grade marketplace for anime collectors. It provides a dedicated space for fans to buy, sell, and auction trading cards, action figures, 3D prints, apparel, and accessories - with built-in protections that general-purpose platforms like eBay or Mercari do not offer.

  **The problem it solves:** Anime collectibles trading is fragmented across dozens of platforms with no consistent fraud protection, language support, or community standards. Ramen Anime centralizes everything into a single trusted platform with:

  - Automated counterfeit and copyright scanning on every listing
  - Escrow-style protection for high-value transactions
  - Currency conversion for cross-border trades
  - 35-language support to serve the global anime community
  - Real-time auction bidding with minimum increment enforcement
  - Geo-restriction compliance for supported markets

  ---

  ## Features

  ### Marketplace
  - Fixed-price listings and live auctions with auto-calculated bid increments
  - Automatic copyright and counterfeit scanning using keyword detection
  - Stripe Connect for seller payouts with 5% platform fee and 3% buyer fee
  - Multi-currency support with live exchange rates
  - Anti-scalping protections on limited-edition items
  - Shipping integration with warehouse support

  ### Authentication and Security
  - Local accounts with scrypt password hashing (512-bit output)
  - Email verification and password reset via Resend
  - JWT session tokens (HS512, 30-day expiry)
  - reCAPTCHA v2 on login and registration
  - Passkey (WebAuthn) support
  - Rate limiting backed by the database with in-memory fallback
  - CSRF protection via origin validation
  - HSTS, X-Frame-Options, and full security header suite

  ### Community
  - Forum with categories, likes, pinned posts, and moderation
  - User profiles with customizable themes, profile songs, and social links
  - Friends and follow system
  - Direct messaging
  - Notification bell with real-time unread count

  ### Administration
  - Admin dashboard with live stats: users, bans, TOS acceptance, orders, donations
  - Per-user TOS acceptance status with checkmark indicator
  - Post and listing moderation tools
  - ID verification review queue
  - Site analytics and swarm (real-time presence) dashboard
  - Automated moderation logs

  ### Payments and Donations
  - Stripe Connect for marketplace transactions
  - PayPal hosted button for donations
  - Revolut link for fee-free transfers
  - Public supporters leaderboard on the donations page

  ---

  ## Tech Stack

  | Layer | Technology |
  |---|---|
  | Frontend | React 19, Vite 6, Tailwind CSS 4, shadcn/ui |
  | API layer | tRPC 11 over Hono (no REST, fully type-safe) |
  | Server | Hono on Node.js via @hono/node-server |
  | Database | TiDB Cloud (MySQL-compatible), Drizzle ORM |
  | Validation | Zod (v4) on both client and server |
  | Auth | scrypt + JWT (HS512) + WebAuthn |
  | Payments | Stripe Connect |
  | Email | Resend |
  | i18n | i18next (35 languages) |
  | Build | Vite (frontend) + esbuild (server) |
  | Testing | Vitest |
  | Deployment | Render.com |

  ---

  ## Project Structure

  ```
  ramenanime/
  ├── api/                    # Hono server and all tRPC routers
  │   ├── boot.ts             # App entrypoint, middleware, Stripe webhook mount
  │   ├── router.ts           # Root tRPC router (assembles all sub-routers)
  │   ├── context.ts          # tRPC context (auth, CSRF check)
  │   ├── middleware.ts       # tRPC procedure builders (public, authed, admin)
  │   ├── *-router.ts         # Feature routers (auth, marketplace, stripe, etc.)
  │   ├── lib/                # Shared server utilities
  │   │   ├── utils/env.ts    # Typed environment variable access
  │   │   ├── utils/logger.ts # Structured logger
  │   │   ├── cookies.ts      # Session cookie options
  │   │   └── rate-limit.ts   # DB-backed rate limiter with memory fallback
  │   ├── queries/            # Database query helpers
  │   └── session/            # JWT session management
  ├── db/
  │   ├── schema.ts           # Full database schema (source of truth)
  │   ├── relations.ts        # Drizzle relation definitions
  │   └── seed.ts             # Database seed script
  ├── src/                    # React frontend
  │   ├── main.tsx            # App entry
  │   ├── App.tsx             # Route definitions
  │   ├── pages/              # Page-level components
  │   ├── components/         # Shared UI components
  │   ├── hooks/              # Custom React hooks
  │   ├── providers/          # tRPC and React Query providers
  │   └── __tests__/          # Unit tests
  ├── contracts/              # Types shared between client and server
  ├── .env.example            # Fully annotated environment variable reference
  ├── render.yaml             # Render.com deployment configuration
  ├── drizzle.config.ts       # Drizzle Kit configuration
  ├── vite.config.ts          # Vite configuration
  └── package.json
  ```

  ---

  ## Getting Started

  ### Prerequisites

  - Node.js 20 or later
  - A TiDB Cloud or MySQL-compatible database
  - A Resend account for transactional email

  ### Local Development

  1. **Clone the repository**

     ```bash
     git clone https://github.com/RamenAnime/RamenAnime.git
     cd RamenAnime
     ```

  2. **Install dependencies**

     ```bash
     npm install
     ```

  3. **Set up environment variables**

     ```bash
     cp .env.example .env
     ```

     Fill in at minimum `DATABASE_URL`, `APP_ID`, and `APP_SECRET`. See [Environment Variables](#environment-variables) for details.

  4. **Push the database schema**

     ```bash
     npm run db:push
     ```

  5. **Start the development server**

     ```bash
     npm run dev
     ```

     This starts both the Vite frontend (port 3000) and the Hono API server (port 3001) concurrently.

  ### Running Tests

  ```bash
  npm test
  ```

  Tests use Vitest and cover password hashing, fee calculation, bid increment rules, copyright scanning, and deposit logic.

  ---

  ## Environment Variables

  See [.env.example](.env.example) for a fully annotated reference. The required variables are:

  | Variable | Description |
  |---|---|
  | `DATABASE_URL` | TiDB Cloud / MySQL connection string |
  | `APP_ID` | Application identifier used in JWT tokens |
  | `APP_SECRET` | Secret key for JWT signing - minimum 32 characters |
  | `RESEND_API_KEY` | Resend API key for transactional email |
  | `SITE_URL` | Public URL used in email links |
  | `STRIPE_SECRET_KEY` | Stripe secret key for payments |
  | `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

  Optional variables (reCAPTCHA, Google Search, admin auto-promote) are documented in `.env.example`.

  ---

  ## Architecture

  ### API Design

  The API is fully built on [tRPC](https://trpc.io/). There are no REST endpoints except `GET /api/ping` (health check) and `POST /api/stripe/webhook` (which must receive the raw unparsed body for signature verification). All business logic flows through typed tRPC procedures.

  ### Authentication Flow

  1. User submits credentials to `auth.login`.
  2. The server verifies the scrypt hash and issues a JWT signed with HS512.
  3. The JWT is set as an `HttpOnly` session cookie with `SameSite=None; Secure` in production.
  4. Subsequent requests are authenticated in `createContext` by verifying the cookie.
  5. Sessions expire after 30 days.

  ### Geo Restriction

  The platform is available in the United States, Canada, all EU member states (excluding the UK), and all Asian countries except North Korea. OFAC-sanctioned countries (Iran, Syria, Cuba, Myanmar, North Korea) are blocked at the middleware layer before any request processing.

  ### Rate Limiting

  Authentication endpoints are rate-limited to 5 attempts per 15-minute window per IP. The limiter is backed by the database for persistence across restarts, with an in-memory fallback when the database is unavailable.

  ### Payments

  Marketplace payments use Stripe Connect. The buyer pays 3% and the seller pays 5% - 8% total per transaction collected as the Stripe application fee. Stripe webhooks at `/api/stripe/webhook` update order and transaction status in real time.

  ### TOS Acceptance

  Users must accept the Terms of Service exactly once per account. The gate is enforced client-side by `TosGate` and server-side via the `tos_acceptances` table. Acceptance is recorded with a version number, IP address, and user agent. The admin dashboard shows a checkmark per user.

  ---

  ## Deployment

  The app deploys to [Render.com](https://render.com) via `render.yaml`.

  **Build command:** `npm install --include=dev && npm run build`

  1. Vite compiles the React frontend to `dist/public/`.
  2. esbuild bundles the Hono API server to `dist/boot.js`.

  **Start command:** `npm start` → `node dist/boot.js`

  The server serves the SPA from `dist/public/` and routes `/api/*` to the Hono handlers.

  All environment variables must be set in the Render dashboard. After deploying, add a Stripe webhook endpoint pointing to `https://ramenanime.com/api/stripe/webhook` with events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `checkout.session.completed`, `account.updated`.

  ---

  ## Public portfolio (recruiters and employers)

  The main application source may be **private**. A separate **public** repository documents the project for hiring managers: architecture, features, metrics, and screenshots.

  | Resource | Link |
  |----------|------|
  | Portfolio repo (public) | [github.com/RamenAnime/RamenAnime-Portfolio](https://github.com/RamenAnime/RamenAnime-Portfolio) |
  | In this repo (submodule) | [`RamenAnime-Portfolio/`](./RamenAnime-Portfolio) |
  | Live product | [ramenanime.com](https://ramenanime.com) |

  **Clone with portfolio included:**

  ```bash
  git clone --recurse-submodules https://github.com/RamenAnime/RamenAnime.git
  ```

  **Update the portfolio submodule** after pushing changes to the portfolio repo:

  ```bash
  cd RamenAnime-Portfolio && git pull origin main && cd ..
  git add RamenAnime-Portfolio && git commit -m "chore: bump portfolio submodule"
  ```

  ---

  ## Contributing

  See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

  ## Security

  See [SECURITY.md](SECURITY.md) for the vulnerability disclosure policy.

  ## License

  This project is proprietary. All rights reserved.
  