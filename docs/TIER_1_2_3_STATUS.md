# Tier 1-3 implementation status

This tracks what was implemented in code vs what you must configure manually. Full setup steps: [MANUAL_SETUP.md](./MANUAL_SETUP.md).

## Tier 1 - Auction core

| Item | Status | Notes |
|------|--------|--------|
| Proxy / second-price bidding | Done | `api/lib/auction-engine.ts` |
| Auto-bid max (自動入札) | Done | `marketplace.setAutoBid` + UI on listing page |
| Anti-snipe (+5 min under 5 min left) | Done | `applyAntiSnipe()` |
| Reserve price on close | Done | `processEndedAuctions()` |
| High-value bid deposits | Done | Listings ≥ $5000; `payDeposit` endpoint |
| Live bid updates (SSE) | Done | `GET /api/auctions/:id/stream` - single-server only; use Redis if you scale horizontally |
| Post-auction orders + 48h pay deadline | Done | `createWinningOrder()` + `processPaymentDeadlines()` |
| Cron (in-process + HTTP) | Done | 60s interval + `GET /api/cron/auctions` |
| Shipping estimate matrix | Done | `estimateShipping` on create listing |
| Stripe checkout | Existing | Configure dashboard (manual) |
| Japan local payments | Stub | UI shows “coming soon”; integrate via Stripe JP or a licensed JP PSP (manual) |

## Tier 2 - Trust and Japan UX

| Item | Status | Notes |
|------|--------|--------|
| Authenticity declaration | Done | Create listing + detail display |
| TCG / item specifics JSON | Done | Optional fields on create |
| In-app outbid / auction notifications | Done | `notifications` table |
| Watchlist ending alerts | Done | On auction close job |
| Email for outbid/won | Manual | Wire SMTP/Resend in `api/lib/notify.ts` |
| Live carrier tracking | Partial | Links + estimates; replace `shipping-router` refresh (manual) |
| Image copyright / bootleg scan | Partial | Text scan only; optional vision/reverse-image APIs (manual) |
| Real-time messaging | Not done | `message-router` still separate SQL layer; UI stub |

## Tier 3 - Seller tools and PWA

| Item | Status | Notes |
|------|--------|--------|
| Escrow release on delivery | Done | `order.markReceived` → `escrowStatus: released` |
| Seller analytics API + profile UI | Done | `sellerAnalytics` on Profile earnings |
| PWA manifest + meta | Done | `public/manifest.json`, `index.html` |
| Service worker | Existing | `public/sw.js` - verify cache strategy on deploy |

## Your checklist (highest impact first)

1. **Commit and push** these changes, then confirm GitHub Actions `npm run build` passes.
2. **Render env:** `STRIPE_*`, `SITE_URL`, `ADMIN_MIGRATION_KEY`, DB URL.
3. **Stripe Connect** + webhook → `https://ramenanime.com/api/stripe/webhook`.
4. **External cron:** `GET /api/cron/auctions` with `X-Admin-Key` every 1-5 min (backup if instance sleeps).
5. **One-time migration:** `GET /api/run-migration` with admin key after deploy.
6. **Test auction flow:** create auction → bid → proxy/auto-bid → wait for end or shorten `auctionEnd` in DB → pay within 48h.
7. **Private main repo** + public portfolio pin (see `GITHUB_PROFILE_SETUP.md`).
8. **Japan legal page** when targeting JP buyers (`/legal/tokushoho`).
9. **Email provider** for transactional mail.
10. **Japan local payments** when you have a PSP contract.

## Known limitations

- SSE pub/sub is in-memory; multiple Render instances need Redis (or similar).
- Deposits are recorded in DB but not charged via Stripe until you wire `payDeposit` to PaymentIntent.
- `sniper_bids` table exists but logic uses proxy ceilings on `auction_bids` instead.
- New i18n keys are English-first; translate in `src/i18n.ts` for other locales as needed.
