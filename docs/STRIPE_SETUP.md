# Stripe Connect setup for Ramen Anime

Use this checklist so marketplace card payments and platform fees work in production.

## 1. Stripe Dashboard

1. Create or open your account at [https://dashboard.stripe.com](https://dashboard.stripe.com).
2. Enable **Connect** under Settings → Connect.
3. Choose **Express** accounts for sellers (already used in code).
4. Copy API keys from Developers → API keys (test keys for local dev).

## 2. Environment variables

Add to `.env` (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Server-side API (`sk_test_...` or `sk_live_...`) |
| `STRIPE_PUBLISHABLE_KEY` | Optional client-side if you add Elements later |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from the webhook endpoint (`whsec_...`) |
| `SITE_URL` | Public site URL for checkout return links (no trailing slash) |

## 3. Webhook endpoint

Production URL:

```text
https://your-domain.com/api/stripe/webhook
```

In Stripe Dashboard → Developers → Webhooks → Add endpoint:

- **Events:** `checkout.session.completed`, `account.updated`
- **URL:** as above

Use the signing secret as `STRIPE_WEBHOOK_SECRET`.

Local testing with Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the `whsec_...` value into `.env` for local runs.

## 4. Seller flow

1. Seller opens **Create listing** or **Profile → Earnings**.
2. Clicks **Connect Stripe** (Express onboarding).
3. Returns to `/seller/stripe-return?success=true`.
4. `account.updated` webhook marks onboarding complete when charges and payouts are enabled.

## 5. Buyer flow

1. **Buy Now** or auction win creates a pending order.
2. Buyer pays via Stripe Checkout (includes 3% buyer fee; 5% seller fee via Connect application fee).
3. `checkout.session.completed` marks the order paid and deactivates the listing.

## 6. Fees (configured in code)

- **5%** platform fee from seller proceeds
- **3%** buyer fee added to checkout total
- Admin dashboard shows GMV and platform fee totals

## 7. Verify

- [ ] Test card: `4242 4242 4242 4242`
- [ ] Webhook deliveries show 200 in Stripe Dashboard
- [ ] Order status becomes `paid` without using dev-only "Mark paid"
- [ ] Admin overview shows GMV and platform fees
