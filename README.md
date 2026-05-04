# ラーメンアニメ (Ramen Anime)

A full-stack anime merchandise marketplace with live auctions, fraud detection, multi-currency support (35 languages), and copyright scanning.

![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4-blue)
![tRPC](https://img.shields.io/badge/tRPC-11-blue)
![Drizzle](https://img.shields.io/badge/Drizzle-ORM-green)
![MySQL](https://img.shields.io/badge/MySQL-TiDB_Cloud-orange)

## Live Site
https://ramen-anime-denj.onrender.com

## Features
- Live auctions with anti-snipe protection
- AI-powered copyright scanning bot
- Multi-currency with 35-language support
- Real-time fraud detection (z-score ML)
- Analytics dashboard with P&L tracking
- 21 inclusive gender options
- Responsive mobile-first design

## Tech Stack
- React 19, TypeScript, Vite 6
- tRPC 11, Drizzle ORM, TiDB Cloud
- Tailwind CSS, shadcn/ui, Recharts
- Zustand state management

## Development Workflow (No local Node.js needed)

All builds happen automatically on Render. To make code changes:

```bash
# Clone the repo
git clone https://github.com/ramenanime/ramenanime.git
cd ramenanime

# Make your changes (edit files in src/, etc.)

# Push to GitHub - Render auto-deploys
git add -A
git commit -m "Your changes"
git push origin main

