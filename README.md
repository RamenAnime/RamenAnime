# ラーメンアニメ (Ramen Anime)

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/tRPC-11-2596BE?logo=trpc" alt="tRPC" />
  <img src="https://img.shields.io/badge/Hono-4-E36002?logo=hono" alt="Hono" />
  <img src="https://img.shields.io/badge/MySQL-TiDB-4479A1?logo=mysql" alt="TiDB" />
</p>

A fullstack anime merchandise and community platform built with React 19, TypeScript, tRPC 11, Hono, Drizzle ORM, and TiDB Cloud. Features an e-commerce storefront, MySpace-style social forum, user marketplace, admin dashboard, real-time notifications, internal messaging, auto-moderation bot, multi-language support, and enterprise-grade security.

**Production URL:** [https://ramen-anime-denj.onrender.com](https://ramen-anime-denj.onrender.com)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Security](#security)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

### E-Commerce
- Product catalog with 3D prints and trading cards
- Shopping cart system
- Tax calculation with live VAT/GST rates for 46 countries

### Social Forum
- MySpace-style customizable user profiles
- Forum posts with categories, likes, and views
- Comment threads with author attribution
- Friends system with friend requests
- Pagination with "Load More" pattern

### User Marketplace
- Buy and sell anime merchandise between users
- Listing creation with images, price, condition
- Category filtering

### Authentication & Identity
- Username/password registration with scrypt hashing
- JWT session management with httpOnly cookies
- Email verification with token-based flow
- Password reset with SHA-256 hashed tokens
- Role-based access control (user/admin)
- Account banning system

### Notifications & Messaging
- Real-time notification bell with unread badges
- Internal PM system (replaces external email dependency)
- Inbox, Sent, and Compose with soft delete

### Content Moderation
- Auto-moderator bot scans all posts, comments, and listings
- Profanity filter, spam detection, excessive caps detection
- Auto-ban after 3 violations in 24 hours
- Full moderation log audit trail
- **Admin shield**: Admin content is exempt from auto-moderation

### Security & Compliance
- IP-based geoblocking with Cloudflare header cross-reference
- Age verification gate (18+) on every new IP/fingerprint
- Terms of Service acceptance tracking
- Rate limiting (sliding window: 15 min / 5 attempts)
- CSRF protection with Origin + Referer validation
- Security headers: HSTS, CSP, X-Frame-Options, X-XSS-Protection
- Multi-jurisdiction legal compliance

### Internationalization
- 7 languages: English, Japanese, Traditional Chinese, Simplified Chinese, Korean, French, German

### Admin Dashboard
- User analytics, user management (ban/unban), donation tracking
- Content moderation logs with filtering
- Tax rate management, moderation review panel

---

## Tech Stack

### Frontend
- React 19 + TypeScript + Vite 6
- Tailwind CSS 3 + shadcn/ui
- react-i18next for translations
- tRPC React Query for type-safe APIs

### Backend
- tRPC 11 + Hono HTTP framework
- Drizzle ORM with MySQL/TiDB Cloud
- jose (HS512 JWT), nodemailer (SMTP)
- zod validation, superjson serialization

### Database
- TiDB Cloud (MySQL-compatible distributed SQL)
- 15 tables with Drizzle ORM relations

### Deployment
- Render.com (Node.js native)
- Cloudflare CDN + Geo IP

---

## Getting Started

### Prerequisites
- Node.js 20+
- TiDB Cloud account (free tier available)

### 1. Clone
```bash
git clone https://github.com/RamenAnime/RamenAnime.git
cd RamenAnime
