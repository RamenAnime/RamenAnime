# Ramen Anime

A global marketplace and social platform for anime collectibles, figures, manga, and trading cards. Built for collectors, by collectors.

**Live:** https://ramen-anime-denj.onrender.com

## Overview

Ramen Anime connects anime enthusiasts worldwide through a secure marketplace with live auctions, integrated social features, and multi-language support. The platform handles everything from listing creation and bidding to shipping and dispute resolution.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS, shadcn/ui |
| Backend | tRPC 11, Hono, Node.js 24 |
| Database | MySQL via TiDB Cloud Serverless |
| ORM | Drizzle ORM |
| Auth | OAuth 2.0 + Username/Password (scrypt) |
| Email | SMTP (Gmail) |
| i18n | 35 languages with RTL support |
| Currency | Live exchange rates via frankfurter.app |

## Project Structure

```
/ramenanime
  api/              - Backend tRPC routers and middleware
  db/               - Database schema, relations, migrations
  src/
    components/     - Reusable UI components
    pages/          - Route-level page components
    hooks/          - Custom React hooks (auth, currency, etc.)
    features/       - Feature-specific modules
    providers/      - Context providers (trpc, theme)
    lib/            - Utility functions
  public/           - Static assets
  docs/             - Project documentation
```

## Database Architecture

42 tables including:
- **Core:** users, user_profiles, user_signatures
- **Marketplace:** marketplace_listings, listing_media, auction_bids, auction_deposits, sniper_bids
- **Commerce:** orders, transactions, package_tracking, warehouse_items
- **Social:** forum_posts, forum_comments, forum_reactions, friends, messages
- **Trust:** seller_ratings, seller_profiles, copyright_scans, moderation_logs
- **Operations:** notifications, tax_rates, geo_verifications, daily_metrics

## API Architecture

Modular tRPC routers:
- **auth** - Registration, login, password reset, email verification, OAuth
- **marketplace** - Listings, bids, auctions, price analysis
- **social** - Forum posts, comments, reactions
- **payment** - Transactions, deposits, fees
- **shipping** - Tracking, warehousing, consolidation
- **notification** - In-app alerts and email
- **admin** - Moderation, analytics, user management
- **currency** - Real-time exchange rates
- **tax** - Regional tax calculation
- **ai** - Price analysis and recommendations
- **donation** - Platform support contributions
- **moderation** - Content flagging and review
- **dispute** - Order dispute resolution

## Deployment

Hosted on Render with auto-deploy from GitHub pushes. Database on TiDB Cloud Serverless with SSL encryption.

## Environment Variables

Required:
- `DATABASE_URL` - MySQL connection string
- `APP_ID` - Application identifier
- `APP_SECRET` - JWT signing secret (32+ characters)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration
- `SITE_URL` - Public-facing domain

Optional:
- `RECAPTCHA_SECRET_KEY` - Bot protection
- `VITE_RECAPTCHA_SITE_KEY` - Frontend CAPTCHA key
- `GOOGLE_API_KEY` + `GOOGLE_CX` - Price analysis
- `OWNER_UNION_ID` - Auto-admin promotion

## Security

- scrypt password hashing (512-bit output)
- JWT sessions with secure cookie flags
- reCAPTCHA v2 on authentication endpoints
- Copyright scanning on image uploads
- Fraud scoring for transactions
- SSL/TLS on all database connections

## License

Private - All rights reserved.
