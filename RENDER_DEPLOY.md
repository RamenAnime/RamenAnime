# Render.com Deployment Guide — Ramen Anime

## Step 1: Push to GitHub (do this first)

```bash
cd /mnt/agents/output/app

# Initialize Git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Production build — legal compliance, geoblocking, donations, age verification"

# Create repo on GitHub (go to github.com/new, name it ramen-anime)
# Then link and push:
git remote add origin https://github.com/YOUR_USERNAME/ramen-anime.git
git branch -M main
git push -u origin main
```

---

## Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with your **GitHub** account (recommended — auto-connects repos)

---

## Step 3: Deploy from Blueprint (One-Click)

Render can read the `render.yaml` file in your repo and auto-configure everything.

1. In Render dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub account if not already
3. Select the `ramen-anime` repo
4. Render will auto-detect `render.yaml` and set:
   - Runtime: Docker
   - Plan: Starter ($7/month)
   - Port: 3000
   - Health check: `/api/ping`

---

## Step 4: Add Environment Variables (CRITICAL)

After the blueprint creates the service, you **must** add the secret values:

1. Click on your **ramen-anime** service
2. Go to **Environment** tab
3. Click **"Add Environment Variable"** for each:

| Key | Value |
|-----|-------|
| `APP_ID` | `19ddeb27-59b2-8276-8000-000065ab22a7` |
| `APP_SECRET` | `QvZaq56hxWCY87puk09PHixrcHY1RJgT` |
| `VITE_APP_ID` | `19ddeb27-59b2-8276-8000-000065ab22a7` |
| `VITE_KIMI_AUTH_URL` | `https://auth.kimi.com` |
| `DATABASE_URL` | `mysql://Ex6YbWnzvLcCpBP.root:6zqpRfTM4LODqp4WtDRUyHAEbzD4KGCj@ep-t4ni387b5e83b7519dc8.epsrv-t4n281l4mrmemi4zls9a.ap-southeast-1.privatelink.aliyuncs.com:4000/19ddeb04-2732-8e28-8000-09abf9cd6e93` |
| `KIMI_AUTH_URL` | `https://auth.kimi.com` |
| `KIMI_OPEN_URL` | `https://open.kimi.com` |
| `OWNER_UNION_ID` | `d7plr5u947o8pv1jr740` |
| `NODE_ENV` | `production` |

> **IMPORTANT:** Do NOT commit the `.env` file to GitHub. These values stay only in Render's dashboard.

---

## Step 5: Start the Service

1. After adding env vars, click **"Manual Deploy"** → **"Deploy latest commit"**
2. Render will:
   - Pull your repo
   - Build the Docker image (`docker build`)
   - Push to Render's registry
   - Start the container
   - Run health checks on `/api/ping`

3. Wait ~3-5 minutes for the build

---

## Step 6: Get Your Live URL

Render gives you a free URL:
- Format: `https://ramen-anime-XXXX.onrender.com`
- Example: `https://ramen-anime-abc123.onrender.com`

**Copy this URL.** You'll need it for:
- Domain connection
- OAuth callback configuration

---

## Step 7: Update OAuth Callback

Your login system uses Kimi OAuth. The callback URL must match:

1. Go to wherever you got your `APP_ID` from (Kimi Portal / Developer Console)
2. Find your app settings
3. Add this to **Authorized Redirect URIs**:
   ```
   https://ramen-anime-XXXX.onrender.com/api/oauth/callback
   ```
4. Save

---

## Step 8: Connect Your Custom Domain (Optional)

### In Render Dashboard:
1. Go to your service → **Settings** → **Custom Domains**
2. Click **"Add Custom Domain"**
3. Enter your domain: `www.yourdomain.com`
4. Render gives you a **CNAME target** (like `ramen-anime-XXXX.onrender.com`)

### In Your Domain Registrar (GoDaddy/Namecheap/Cloudflare):
1. Go to DNS Management
2. Add a **CNAME** record:
   - Name: `www`
   - Value: `ramen-anime-XXXX.onrender.com`
   - TTL: 600
3. For root domain (`yourdomain.com` without `www`):
   - Add **A record** pointing to `216.24.57.1` (Render's anycast IP)
   - Or use a **CNAME flattening** if your registrar supports it (Cloudflare does)

### Wait & Verify
- DNS propagation: 5 minutes to 24 hours (usually 5-15 min)
- Render auto-provisions **free SSL certificate** via Let's Encrypt
- Your site will be `https://www.yourdomain.com`

---

## Step 9: Verify Everything Works

Test checklist:
- [ ] Homepage loads at your URL
- [ ] Language switcher works (English/Japanese/Chinese/Korean/French)
- [ ] Click "Join / Login" — OAuth redirects work
- [ ] Age verification gate appears for new users
- [ ] Geoblocking works (test with VPN from blocked country)
- [ ] Footer links go to `/terms` and `/privacy`
- [ ] Donation page shows country-specific payment methods
- [ ] Marketplace loads with "Sell an Item" button
- [ ] Mobile responsive (test on phone)

---

## Step 10: Enable Auto-Deploy (Recommended)

In Render Dashboard:
1. Service → **Settings** → **Deploy**
2. Enable **"Auto-Deploy"**
3. Now every `git push` to your `main` branch auto-redeploys

---

## Pricing

| Plan | Cost | Specs |
|------|------|-------|
| **Free** | $0 | Spins down after 15 min idle, slow cold start |
| **Starter** | $7/mo | Always on, 512MB RAM, shared CPU |
| **Standard** | $25/mo | 2GB RAM, dedicated CPU |
| **Pro** | $85/mo | 4GB RAM, high performance |

**My recommendation:** Start with **Starter ($7/mo)** — it's always-on so users never wait for cold starts. Upgrade when you hit 1000+ daily users.

---

## Troubleshooting

### Build Fails
```
# Check logs in Render Dashboard → Logs tab
# Common fixes:
# 1. Missing env var → add it in Environment tab
# 2. DB connection fail → verify DATABASE_URL is correct
# 3. Port issue → make sure app listens on PORT env var
```

### OAuth Login Fails
- Verify callback URL in Kimi portal matches exactly
- Must include `https://` and `/api/oauth/callback`
- No trailing slash

### Database Connection Error
- Check if `DATABASE_URL` has `?ssl={"rejectUnauthorized":true}` at the end
- Make sure the TiDB cluster is still active (free tiers may sleep after inactivity)

### Site Shows "Not Found"
- Make sure `NODE_ENV=production` is set
- Check that `serveStaticFiles` is working in `api/boot.ts`

---

## Quick Redeploy Command

After making code changes locally:
```bash
git add .
git commit -m "Update: [describe change]"
git push origin main
# Render auto-deploys if enabled, or click "Manual Deploy" in dashboard
```

---

## Support

- Render Docs: [render.com/docs](https://render.com/docs)
- Render Status: [status.render.com](https://status.render.com)
- Your Database Host: Check TiDB Cloud / PlanetScale / etc.
