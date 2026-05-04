# ラーメンアニメ (Ramen Anime)

A full-stack anime merchandise marketplace with live auctions, social features, multi-language support (35 languages), real-time messaging, and AI-assisted listing tools.

**Live URL:** https://ramen-anime-denj.onrender.com

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite 6 + Tailwind CSS + shadcn/ui |
| Backend | tRPC 11 + Hono + Node.js 24 |
| ORM | Drizzle ORM |
| Database | MySQL (TiDB Cloud) |
| Auth | OAuth 2.0 + Username/Password (bcrypt) |
| Real-time | Server-Sent Events |
| i18n | i18next with RTL support (Arabic, Hebrew) |
| Currency | Live exchange rates via frankfurter.app (ECB) |

---

## Project Structure
├── api/                    # Backend routers and middleware
│   ├── lib/               # Utilities (env, copyright-bot)
│   ├── middleware.ts      # tRPC auth middleware
│   └── *-router.ts        # Feature routers
├── db/
│   ├── schema.ts          # Drizzle schema (all tables)
│   └── relations.ts       # Drizzle relations
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui primitives
│   │   └── legal/        # TOS, Privacy Policy
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities (media compression)
│   ├── pages/            # Route pages
│   ├── providers/        # tRPC provider
│   └── store/            # Zustand state management
├── .github/workflows/    # CI/CD
├── CONTRIBUTING.md        # Contribution guidelines
├── CODE_OF_CONDUCT.md    # Community standards
├── SECURITY.md           # Security policy
└── package.json          # Scripts and dependencies

---

## Quick Start

### Prerequisites
- Node.js 22+
- MySQL database (or TiDB Cloud account)

### Environment Variables
Create a `.env` file:
```env
DATABASE_URL=mysql://user:pass@host:4000/db?ssl={"rejectUnauthorized":true}
APP_ID=your_app_id
APP_SECRET=your_app_secret
GOOGLE_API_KEY=optional_for_ai_search
GOOGLE_CX=optional_for_ai_search
OWNER_UNION_ID=your_admin_union_id
Features
Marketplace
Fixed-price and auction listings
Live countdown timers with anti-snipe (+5 min extension)
Proxy bidding with automatic increments
Deposit system for high-value auctions
Watchlist with notifications
Price negotiation (make offer / accept / counter)
Seller ratings and level system
Q&A on listings
Media
Universal image compression (WebP/JPEG, 92% quality)
Video upload with thumbnail generation
Audio upload support
Copyright detection bot scans all listings
Social
Forum with categories, pins, reactions
Friend system with requests
Real-time messaging
User profiles with avatars
International
35 languages with auto-detection
RTL support (Arabic, Hebrew)
Multi-currency with live exchange rates
Geo-blocking with compliance frameworks
VAT/tax calculation per country
Admin
Dashboard with user management
Content moderation
Fraud scoring
Dispute resolution
Auction monitoring (anti-scalping)
| Table                          | Purpose                   |
| ------------------------------ | ------------------------- |
| `users`                        | Accounts (OAuth + local)  |
| `userProfiles`                 | Extended profile data     |
| `marketplaceListings`          | Products and auctions     |
| `listingMedia`                 | Images, videos, audio     |
| `auctionBids`                  | Bid history               |
| `auctionDeposits`              | Security deposits         |
| `watchlistItems`               | Saved listings            |
| `listingQuestions`             | Q\&A threads              |
| `sellerRatings`                | Reviews                   |
| `sellerProfiles`               | Seller stats and levels   |
| `priceOffers`                  | Negotiation offers        |
| `copyrightScans`               | Bot scan results          |
| `forumPosts` / `forumComments` | Social content            |
| `friends`                      | Friend connections        |
| `messages`                     | Chat history              |
| `notifications`                | User alerts               |
| `taxRates`                     | Per-country VAT           |
| `shippingRates`                | Shipping costs            |
| `geoVerifications`             | Age/location verification |
| `idVerifications`              | ID document verification  |
| `tosAcceptances`               | Terms acceptance tracking |

| Router         | Endpoints                              |
| -------------- | -------------------------------------- |
| `auth`         | Login, register, OAuth, verify email   |
| `marketplace`  | CRUD listings, bids, watchlist, offers |
| `social`       | Posts, comments, friends, reactions    |
| `message`      | Real-time chat, typing indicators      |
| `notification` | Alerts, mark read                      |
| `admin`        | User management, moderation            |
| `currency`     | Live exchange rates                    |
| `tax`          | VAT lookup per country                 |
| `shipping`     | Rate calculation, tracking             |
| `ai`           | Trend search, listing suggestions      |
| `donation`     | Tip jar for platform                   |
| `moderation`   | Content flagging, bans                 |
| `dispute`      | Conflict resolution                    |

Engineering Teams
Team Alpha - Core Platform
Lead: Backend Architect
Authentication system (OAuth + local)
Database schema and migrations
tRPC middleware and error handling
Environment configuration
CI/CD pipeline
Team Bravo - Marketplace
Lead: Full-Stack Engineer
Listing CRUD and search
Auction engine (countdown, anti-snipe, proxy bids)
Payment flow and deposits
Media upload and compression
Copyright detection bot
Team Charlie - Social & Community
Lead: Frontend Engineer
Forum (posts, comments, reactions, pins)
Friend system
Real-time messaging (SSE)
User profiles
Notifications
Team Delta - International & Compliance
Lead: DevOps Engineer
35-language i18n system
RTL layout support
Multi-currency with live rates
Geo-blocking and age verification
VAT/tax calculation
Legal framework routing (GDPR, CCPA, etc.)
Team Echo - Operations
Lead: Product Manager
Admin dashboard
Content moderation tools
Fraud detection
Analytics and reporting
Dispute resolution
Contributing
See CONTRIBUTING.md for:
Feature branch workflow
Code standards
PR checklist
Naming conventions
Security
See SECURITY.md for:
Reporting vulnerabilities
Security practices
API key management
License
Private - All rights reserved.
