/**
 * Sends the owner setup checklist via SMTP.
 * Usage: npx tsx scripts/send-setup-email.ts [recipient@email.com]
 */
import "dotenv/config";
import { sendEmail, isSmtpConfigured } from "../api/lib/mailer";

const to = process.argv[2] || "jasonjones21@att.net";

const html = `
<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#111;max-width:640px">
<h1 style="color:#F97316">Ramen Anime - your action checklist</h1>
<p>Hi Jason, this is an automated checklist for items that still need your dashboard or legal setup (code for auctions, SMTP, messaging, and deposits is deployed separately).</p>

<h2>1. SMTP (required for all site email)</h2>
<p>Set on Render: <code>SMTP_HOST</code>, <code>SMTP_PORT</code> (587), <code>SMTP_USER</code>, <code>SMTP_PASS</code> (Gmail app password), <code>SMTP_FROM</code>.</p>

<h2>2. Stripe</h2>
<ul>
<li>Connect Express enabled for sellers</li>
<li>Webhook: <code>POST https://ramenanime.com/api/stripe/webhook</code></li>
<li>Events: checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed, account.updated</li>
<li>Env: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SITE_URL</li>
</ul>

<h2>3. Image copyright APIs (optional but recommended)</h2>
<ul>
<li><code>GOOGLE_VISION_API_KEY</code> - Cloud Vision API for listing photos</li>
<li><code>TINEYE_API_KEY</code> + <code>TINEYE_API_SECRET</code> - reverse image search</li>
<li>Review flagged listings in Admin → Copyright queue</li>
</ul>

<h2>4. Auction cron backup</h2>
<p>Every 1-5 min: <code>GET https://ramenanime.com/api/cron/auctions</code> with header <code>X-Admin-Key</code>.</p>

<h2>5. PayPay / Konbini</h2>
<p>Still “coming soon” in UI until you contract Stripe Japan, PayPay for Business, or Komoju/GMO.</p>

<h2>6. Carrier live tracking</h2>
<p>Replace simulated tracking in shipping-router when you have Yamato/Japan Post API credentials.</p>

<h2>7. Private repo + portfolio</h2>
<p>Make RamenAnime/RamenAnime private; keep RamenAnime-Portfolio public and pinned on your GitHub profile.</p>

<h2>8. Japan legal</h2>
<p>Tokushoho page is live at <a href="https://ramenanime.com/legal/tokushoho">/legal/tokushoho</a> - have a lawyer review and fill in your business address and registration numbers.</p>

<p>Docs in repo: <code>docs/MANUAL_SETUP.md</code>, <code>docs/TIER_1_2_3_STATUS.md</code></p>
<p style="color:#666;font-size:12px">- Ramen Anime automated setup mail</p>
</body></html>
`;

async function main() {
  if (!isSmtpConfigured()) {
    console.error("SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env then re-run.");
    console.error("Intended recipient:", to);
    process.exit(1);
  }
  const ok = await sendEmail(to, "Ramen Anime - setup checklist (action required)", html);
  console.log(ok ? `Sent to ${to}` : `Failed to send to ${to}`);
  process.exit(ok ? 0 : 1);
}

main();
