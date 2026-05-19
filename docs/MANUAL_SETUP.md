# Manual setup guide (things you must do outside the codebase)

This document lists integrations and operations that **cannot** be fully automated in GitHub Actions or by the AI agent. Complete these to reach production quality comparable to Yahoo! Auctions Japan.

---

## 1. Payments

### Stripe (done in code - you configure dashboards)

| Step | Action |
|------|--------|
| 1 | [Stripe Dashboard](https://dashboard.stripe.com) → Connect → enable **Express** accounts for sellers |
| 2 | Add env vars on Render: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL=https://ramenanime.com` |
| 3 | Webhook endpoint: `https://ramenanime.com/api/stripe/webhook` |
| 4 | Events: `checkout.session.completed`, `account.updated`, `payment_intent.succeeded`, `payment_intent.payment_failed` |

### PayPay / Konbini (not implemented - UI shows “coming soon”)

To match Yahoo! Auctions in Japan you need one of:

- **Stripe Japan** with local payment methods, or  
- **PayPay for Business** API: https://developer.paypay.ne.jp/  
- **Komoju** or **GMO Payment Gateway** for konbini payments  

Until integrated, Japanese buyers should use **Stripe card checkout** (works globally).

---

## 2. Auction cron on Render

The server runs `runAuctionMaintenance()` every **60 seconds** when the Node process is up.

For redundancy, add a **Render Cron Job** (or external cron):

```http
GET https://ramenanime.com/api/cron/auctions
Header: X-Admin-Key: YOUR_ADMIN_MIGRATION_KEY
```

Schedule: every 1-5 minutes.

This closes ended auctions, enforces reserve price, creates winner orders with **48h payment deadline**, and cancels unpaid orders after deadline.

---

## 3. Real-time auctions (SSE)

Implemented at `GET /api/auctions/:listingId/stream`.

- Works behind Render without extra config.  
- If you add **Cloudflare**, ensure SSE is not buffered (disable buffering for `/api/auctions/*`).

---

## 4. Shipping carriers (live tracking)

Code includes **Yamato, Sagawa, Japan Post, DHL** links and **estimate matrix** only.

For live tracking APIs:

| Carrier | Integration |
|---------|-------------|
| Japan Post | [Yu-Pack API](https://www.post.japanpost.jp/) business tools |
| Yamato | Kuroneko Web API (contract required) |
| Sagawa | e-コレクト API |

Replace simulated `refreshTracking` in `api/shipping-router.ts` when you have credentials.

---

## 5. Email notifications (outbid, auction won)

In-app notifications are written to the `notifications` table.

For email (recommended):

1. Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` on Render (Gmail app password works).  
2. All auth and marketplace emails use `api/lib/mailer.ts` (nodemailer SMTP only).  
3. Run locally: `npm run send-setup-email -- jasonjones21@att.net` to send the owner checklist.

---

## 6. Image copyright / bootleg detection

Current scanner is **text-only** (`api/lib/copyright-bot.ts`).

For Yahoo-level trust on anime goods:

- **Google Cloud Vision** safe search + label detection  
- **TinEye** or custom model for duplicate listing images  
- Manual admin review queue (use Admin dashboard)

---

## 7. Database

Production uses **TiDB Cloud** / MySQL. After deploy:

1. Hit `GET /api/run-migration` once with `X-Admin-Key` to add new columns  
2. Or rely on boot `runMigrations()` on server start  

New columns: `shipping_payer`, `shipping_cost`, `package_size`, `item_specifics`, `authenticity_declared`.

---

## 8. Private repo + portfolio

See [GITHUB_PROFILE_SETUP.md](./GITHUB_PROFILE_SETUP.md) and [RamenAnime-Portfolio](https://github.com/RamenAnime/RamenAnime-Portfolio).

---

## 9. Optional: Render background worker

If the web service sleeps on free tier, cron inside the process may pause. Upgrade to a always-on instance or use external cron hitting `/api/cron/auctions`.

---

## 10. Legal (Japan marketplace)

Consult a lawyer for:

- 特定商取引法 (Specified Commercial Transactions Act) disclosure page  
- Consumption tax (消費税) display for JP sellers  
- Terms for auctions and non-paying bidders  

Add a `/legal/tokushoho` page when selling primarily to Japan.

---

## What was implemented in code (reference)

| Feature | Location |
|---------|----------|
| Proxy / auto-bid engine | `api/lib/auction-engine.ts` |
| Anti-snipe (+5 min) | same |
| SSE live updates | `api/routes/auction-stream.ts`, `useAuctionStream` hook |
| Post-auction + payment deadline | `api/lib/auction-jobs.ts` |
| Shipping estimates | `api/lib/shipping-calculator.ts` |
| Escrow release on delivery | `api/order-router.ts` `markReceived` |
| Seller analytics | `marketplace.sellerAnalytics` |
| Authenticity + TCG fields | create listing + listing detail |
| PWA manifest | `public/manifest.json` |
