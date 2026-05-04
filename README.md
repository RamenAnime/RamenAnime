# 🍜 ラーメンアニメ (Ramen Anime)

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/tRPC-11-2596BE?logo=trpc" />
  <img src="https://img.shields.io/badge/Drizzle-ORM-CA5B8D?logo=drizzle" />
  <img src="https://img.shields.io/badge/MySQL-TiDB-4479A1?logo=mysql" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" />
  <img src="https://img.shields.io/badge/Render-Deployed-46E3B7?logo=render" />
</p>

<p align="center"><b>The ultimate anime merchandise marketplace with live auctions, escrow protection, and multi-currency support.</b></p>

<p align="center">
  <a href="https://ramen-anime-denj.onrender.com">🌐 Live Site</a> •
  <a href="https://ramen-anime-denj.onrender.com/marketplace">🛒 Marketplace</a> •
  <a href="https://ramen-anime-denj.onrender.com/shop">🛍️ Shop</a> •
  <a href="https://ramen-anime-denj.onrender.com/social">💬 Community</a>
</p>

---

## 📸 Screenshots

| Home | Marketplace | Auction |
|------|-------------|---------|
| ![Home](docs/screenshots/home.png) | ![Marketplace](docs/screenshots/marketplace.png) | ![Auction](docs/screenshots/auction.png) |

| Orders | Create Listing | Profile |
|--------|----------------|---------|
| ![Orders](docs/screenshots/orders.png) | ![Create](docs/screenshots/create.png) | ![Profile](docs/screenshots/profile.png) |

---

## ✨ Features

### 🛒 Marketplace & Auctions
- **Buy Now** - Instant purchase with escrow protection
- **Make an Offer** - Price negotiation
- **Live Auctions** - Real-time bidding with anti-snipe
- **Proxy/Sniper Bidding** - Auto-bid up to your max
- **Reserve Prices** - Hidden minimum prices
- **Deposit System** - Required for $5,000+ auctions

### 💰 Payments (6 Methods)
| Method | Region | Fee |
|--------|--------|-----|
| Credit/Debit Card | Global | 2.9% + $0.30 |
| PayPay | Japan | 1.5% |
| Konbini | Japan | 2.0% |
| Bank Transfer | Japan | 0% |
| Escrow Protection | Global | 3.5% |

### 📦 Shipping & Tracking
- **8 carriers**: Japan Post, Yamato, Sagawa, DHL, FedEx, UPS, USPS, SF Express
- **Live tracking** with status updates
- **Warehouse consolidation** - Combine shipments
- **Order #** (RA-XXXXXXXX-XXXX) and **Transaction #** (TX-XXXXXXXX-XXXXX)

### 🔐 Multi-Layer Security
| Layer | Technology | Standard |
|-------|-----------|----------|
| **Transit** | TLS 1.3 (PQC-hybrid ready) | RFC 8446 |
| **App Encryption** | ChaCha20-Poly1305 | RFC 8439 |
| **Passwords** | Argon2id (64MB, 3 iterations) | PHC Winner |
| **Authentication** | ECDSA Passkeys (WebAuthn/FIDO2) | FIDO Alliance |
| **Disk** | AES-XTS-256 | FIPS 197 |
| **Key Storage** | FIPS 140-3 Level 3 HSM Ready | NIST |

### 🌍 Global Support
- **35 languages** with RTL support
- **Multi-currency** with live ECB exchange rates
- **Auto-detected** by country

### 🤖 AI-Powered
- AI title & description generation
- Price trend analysis
- Copyright scanning (image + text)
- Anti-scalping bot

### 👥 Social
- Profiles with themes & profile songs
- Friends system
- Forum with categories
- Direct messaging
- Seller ratings (Bronze to Diamond)

### 🛡️ Compliance
- GDPR / CCPA / PIPEDA / LGPD
- Tax calculation per country
- Age & ID verification
- Export control compliance

---

## 🚀 Tech Stack

**Frontend:** React 19 + TypeScript + Vite 6 + Tailwind CSS + shadcn/ui + i18next (35 languages) + WebAuthn

**Backend:** tRPC 11.x + Hono + Drizzle ORM + MySQL (TiDB Cloud) + Zod validation

**Security:** Argon2id + ChaCha20-Poly1305 + WebAuthn/Passkeys + JWT + Rate limiting

---

## 📋 Quick Start

```bash
git clone https://github.com/ramenanime/ramenanime.git
cd ramenanime
npm install
cp .env.example .env
# Edit .env with your database URL and credentials
npm run db:push
npm run dev
