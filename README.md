# The Cream Collective

Premium curated fashion boutique — Kampala, Uganda.
Custom tech stack: Turso SQLite + Node.js/Express + Vite PWA.

## Quick Start

```bash
# Backend
cd backend && npm install && npm start

# Frontend (build once)
cd frontend && npm install && npm run build
```

Open http://localhost:3000 on your Samsung S21.

## Project Structure

```
shared/
├── backend/          # Node.js/Express API (port 3000)
│   ├── index.js       # 14 REST endpoints
│   ├── db.js          # Turso/SQLite via team-db CLI
│   └── README.md
├── frontend/         # Vite + vanilla JS PWA
│   ├── main.js        # App: Catalog, Inventory, POS, Analytics
│   ├── style.css      # Mobile-first, cream/gold palette
│   ├── sw.js          # Service worker (offline app shell)
│   └── public/        # Manifest, icons
├── schema.sql        # Database DDL
├── technical-blueprint.md  # Full architecture doc
└── .gitignore
```

## Core Workflow

1. **Bale Breaking** → Catalog items via mobile camera + category/size/price
2. **Reservation** → 30-min lock prevents double-sells across channels
3. **Sale** → Record with Cash or Mobile Money (MTN/Airtel)
4. **Analytics** → Track turnover, margins, channel performance