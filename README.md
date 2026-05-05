# Ramen Anime

Full-stack anime merchandise marketplace with live auctions, social features, 35 languages, and real-time messaging.

**Live:** https://ramenanime.com

**Quick Links:** [Business Plan](docs/BUSINESS_PLAN.md) · [Custom Domain Setup](docs/DOMAIN_SETUP.md)

## Tech Stack
- Frontend: React 19 + TypeScript + Vite 6 + Tailwind CSS + shadcn/ui
- Backend: tRPC 11 + Hono + Node.js 24
- ORM: Drizzle ORM + MySQL (TiDB Cloud)
- Auth: OAuth 2.0 + Username/Password
- i18n: 35 languages with RTL support
- Currency: Live exchange rates via frankfurter.app

## Quick Start (No npm Required)
1. Edit code in any text editor
2. Push to GitHub: git add -A && git commit -m "changes" && git push origin main
3. Render auto-deploys in ~2 minutes

## Project Structure
- api/ - Backend routers (tRPC)
- db/ - Database schema and relations
- src/components/ - UI components
- src/pages/ - Route pages
- src/hooks/ - Custom React hooks
- src/features/ - Feature modules
- docs/ - Documentation ([Business Plan](docs/BUSINESS_PLAN.md), [Domain Setup](docs/DOMAIN_SETUP.md))

## Database Tables
users, marketplaceListings, listingMedia, auctionBids, watchlistItems, listingQuestions, sellerRatings, sellerProfiles, priceOffers, copyrightScans, forumPosts, forumComments, friends, messages, notifications, taxRates, shippingRates

## API Routers
auth, marketplace, social, message, notification, admin, currency, tax, shipping, ai, donation, moderation, dispute

## Teams
- Alpha: Core Platform (auth, db, ci/cd)
- Bravo: Marketplace (listings, auctions, media)
- Charlie: Social (forum, chat, profiles)
- Delta: International (i18n, currency, compliance)
- Echo: Operations (admin, moderation, analytics)

## Contributing
See CONTRIBUTING.md

## License
Private - All rights reserved.
