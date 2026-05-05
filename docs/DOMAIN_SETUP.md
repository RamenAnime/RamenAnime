# Custom Domain Setup Guide

**GoDaddy Domain → Render Hosting**

---

## Overview

This guide walks you through connecting your real domain (purchased from GoDaddy) to your Ramen Anime app hosted on Render. This replaces the random `*.onrender.com` URL with your branded domain (e.g., `ramenanime.com`).

**Time needed:** ~15 minutes
**Cost:** Free (Render custom domains are free on all plans)

---

## Step 1: Buy Your Domain (GoDaddy)

If you haven't already, buy your domain at [godaddy.com](https://godaddy.com).

**Recommended domains for this project:**
- `ramenanime.com`
- `ramenanime.store`
- `ramen-anime.com`
- `ramencollectibles.com`

---

## Step 2: Get Your Render App URL

1. Log in to [dashboard.render.com](https://dashboard.render.com)
2. Click your **ramen-anime** service
3. Copy the current URL (looks like `https://ramenanime.com`)
4. Keep this tab open — you'll need it

---

## Step 3: Add Custom Domain in Render

1. In your Render dashboard, click the **Settings** tab
2. Scroll down to **Custom Domains**
3. Click **Add Custom Domain**
4. Enter your domain:
   - For root domain: `ramenanime.com`
   - For www subdomain: `www.ramenanime.com`
5. Render will show you DNS records to add — **copy these values**

**Example of what Render shows:**
```
Type:  A
Name:  @
Value: 216.24.57.1

Type:  CNAME
Name:  www
Value: ramenanime.com
```

---

## Step 4: Update DNS Records in GoDaddy

1. Log in to [account.godaddy.com](https://account.godaddy.com)
2. Go to **My Products** → **DNS** next to your domain
3. You are now on the **DNS Management** page
4. Delete any existing A, CNAME, or AAAA records for `@` and `www` to avoid conflicts

### Add these DNS records from Render:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `216.24.57.1` (Render's IP) | 600 seconds |
| CNAME | www | `ramenanime.com` | 1 hour |

> **Note:** The exact IP and CNAME values are provided by Render in Step 3. Use what Render gives you, not the examples above.

5. Click **Save**

---

## Step 5: Wait for DNS to Propagate

DNS changes can take **5 minutes to 48 hours** to work everywhere. Usually it's fast.

**To check if it's working:**

```bash
# In Git Bash or any terminal
nslookup ramenanime.com
```

If it shows Render's IP address, the DNS is working.

---

## Step 6: Verify SSL Certificate (HTTPS)

Render automatically provides free SSL certificates for custom domains.

1. In your Render dashboard, go to **Settings** → **Custom Domains**
2. You should see your domain with a green checkmark and **SSL: Automatic**
3. If it says **Pending**, wait 10-15 minutes and refresh

**Test your site:**
- Open `https://ramenanime.com` in a browser
- You should see a lock icon next to the URL
- If you get a security warning, the SSL certificate is still being issued — just wait

---

## Step 7: Update Environment Variables

Your frontend code might reference the Render URL. Update these:

### In Render Dashboard:

1. Go to **Environment** tab in your Render service
2. Update or add:

| Key | Value | Example |
|-----|-------|---------|
| `VITE_APP_URL` | `https://ramenanime.com` | Your real domain |
| `CORS_ORIGIN` | `https://ramenanime.com` | For API CORS |

3. Click **Save Changes**
4. Render will redeploy automatically

### In your .env.example file (for reference):

Update the `.env.example` in your repo:

```env
# Frontend
VITE_APP_URL=https://ramenanime.com

# API CORS
CORS_ORIGIN=https://ramenanime.com
```

---

## Step 8: Redirect www to Non-www (or Vice Versa)

Pick one as your main URL and redirect the other. This is better for SEO.

**Option A: Non-www is main (`ramenanime.com`)**
- The CNAME record for `www` handles the redirect automatically through Render

**Option B: www is main (`www.ramenanime.com`)**
- Add a forwarding rule in GoDaddy DNS for `@` (root) to redirect to `www.ramenanime.com`

Render handles this automatically once both DNS records are set up.

---

## Troubleshooting

### "Site not found" error
- Double-check the DNS records match exactly what Render provided
- Make sure you deleted old conflicting A/CNAME records in GoDaddy

### SSL certificate stuck on "Pending"
- Make sure your DNS records are correct
- Try removing and re-adding the custom domain in Render
- Wait up to 24 hours — SSL issuance can be slow

### Domain shows old site
- Clear your browser cache (Ctrl+Shift+R)
- DNS may still be propagating — wait and try again

### Emails stopped working
- If you had email set up with GoDaddy, adding new DNS records might affect it
- Make sure any existing MX (email) records are still in place

---

## Summary Checklist

- [ ] Bought domain on GoDaddy
- [ ] Added custom domain in Render dashboard
- [ ] Copied DNS records from Render
- [ ] Added A and CNAME records in GoDaddy DNS
- [ ] Saved DNS changes
- [ ] Waited for propagation
- [ ] Verified SSL certificate is active
- [ ] Updated environment variables with new domain
- [ ] Tested site loads on real domain
- [ ] Tested HTTPS/lock icon shows in browser

---

## Need Help?

- **Render docs:** [render.com/docs/custom-domains](https://render.com/docs/custom-domains)
- **GoDaddy DNS help:** [godaddy.com/help/manage-dns-records-680](https://www.godaddy.com/help/manage-dns-records-680)
