# The Block — Vehicle Auction Platform

A buyer-side vehicle auction prototype built for the OPENLANE coding challenge.

The app focuses on the core buyer journey: browse auction inventory, inspect a vehicle, place a bid or buy now, save and compare listings, and track outcomes from a dedicated bids page.

![The Block](public/the_block_repo.png)

---

## Live Demo

Production deployment: https://the-block-omega.vercel.app

Deployed on Vercel. The frontend is designed to keep working without the API server by using guest mode and local browser persistence.

---

## Quick Start

**Requirements:** Node.js 18+

```bash
git clone https://github.com/jamamv/the-block.git
cd the-block
npm install
npm run dev:full
```

`npm run dev:full` starts both services:

- Frontend: `http://localhost:5173`
- API server: `http://localhost:3001`

Frontend only:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite frontend |
| `npm run server` | Start the Express API server |
| `npm run dev:full` | Start frontend and API together |
| `npm test` | Run the Vitest utility test suite |
| `npm run build` | Type-check and build the production frontend |
| `npm run preview` | Preview the production build locally |

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite 8, TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Backend | Node.js, Express |
| Auth | bcrypt, JWT |
| Database | SQLite via better-sqlite3 |
| Persistence | localStorage for bids, watchlist, and settings |
| Deployment | Vercel frontend |

---

## Code Walkthrough

For a file-by-file explanation of the project architecture, see [`CODEBASE_GUIDE.md`](CODEBASE_GUIDE.md).

---

## Main Routes

| Route | Purpose |
|---|---|
| `/` | Inventory, search, filters, sorting, saved view, comparison |
| `/?saved=1` | Saved/watchlist inventory view |
| `/vehicle/:id` | Vehicle detail, gallery, specs, bidding, buy now |
| `/bids` | User bid tracking and outcome states |
| `/submit` | Vehicle submission form |
| `/login` | Sign in or continue as guest |
| `/register` | Create an account |

---

## Features

### At a Glance

- Buyer inventory with search, filters, sorting, saved vehicles, and comparison
- Vehicle detail pages with gallery, specs, condition report, WhatsApp sharing, bidding, and Buy Now
- Dedicated My Bids page with active, won, lost, and purchased states
- Seller-side List a Car form with validation and confirmation screen
- Notifications for watched vehicles going live and bids ending soon
- Dark mode, CAD/USD currency toggle, and English/French locale toggle
- Auth with register/login, JWT sessions, and guest mode for frontend-only demos
- Responsive desktop and mobile layouts with bottom navigation on small screens

### Inventory

- 200 generated vehicle listings loaded from local data
- Search across brand, model, VIN, lot number, fuel type, body style, city, province, and dealership
- Predictive search suggestions for brands, body styles, fuel types, and auction states
- Desktop sidebar filters and mobile filter drawer
- Filters for auction status, brand, body style, title status, and province
- Live filter counts
- Sort by highest bid, lowest bid, newest year, lowest mileage, and best condition
- Vehicle cards with image, badges, lot number, auction status, condition bar, bid count, reserve status, and Buy Now price
- Market price labels such as Great Deal and High Bid based on peer median bid
- Watchlist with heart buttons, persisted to `localStorage`
- Shareable saved view through `/?saved=1`

### Vehicle Detail

- Vehicle page with breadcrumb navigation
- Image gallery with thumbnail strip and previous/next controls
- Title, fuel, and condition badges
- Full specs grid
- Condition report with grade, progress bar, damage notes, and disclosure-style details
- Auction details including starting bid, reserve, Buy Now price, and auction start date
- WhatsApp share link
- Live auction status and countdown
- Sticky bid panel on desktop
- Verified dealer badge for dealers with at least five listings

### Bidding and Buy Now

- Bid form gated behind auth or guest mode
- Minimum bid increment validation
- Confirmation step before placing a bid
- Success state after placing a bid
- Buy Now confirmation flow
- Reserve met/not met indicator
- Retract bid flow with confirmation
- Bid state updates immediately across inventory cards, detail pages, and My Bids
- Bid state persisted to `localStorage`

### Seller Listing Flow

- `/submit` form for listing a vehicle for auction review
- Vehicle identity fields: year, brand, model, trim, body style, fuel type, transmission, drivetrain, odometer, condition grade, and title status
- Seller/location fields: province, city, and dealership name
- Auction pricing fields: starting bid, reserve price, and optional Buy Now price
- Condition notes field for damage, service history, or notable details
- Inline validation for required fields, year range, and condition grade
- Confirmation screen after successful submission

### My Bids

- Dedicated `/bids` page
- Tracks every vehicle the user has bid on or purchased
- Outcome states: Active, Won, Lost, Purchased
- Active rows show countdown/status
- Won and purchased rows use positive outcome styling
- Lost rows show reserve-not-met state with muted image treatment
- Retract active bids or remove ended bid records
- Summary subtitle such as active, won, purchased, and not sold counts

### Compare

- Select up to two vehicles from inventory
- Bottom comparison drawer
- Expandable side-by-side comparison
- Highlights differing fields
- Compares price, odometer, condition, year, fuel, title, drivetrain, location, dealer, and auction status

### Notifications

- Header notification bell with count badge
- Alerts for watched vehicles going live
- Alerts for bids ending soon
- Notification menu with urgency-based ordering
- Empty notification state when there is nothing to act on

### Settings and Localization

- Settings popover in the header
- Dark mode toggle persisted to `localStorage`
- Currency toggle between CAD and USD
- Locale toggle between English and French
- Currency formatting updates visible prices throughout the app
- Locale setting drives app copy through the shared `t(...)` helper
- Central `SettingsProvider` exposes `t(...)` translations and `fmt(...)` currency formatting

### Auth and Guest Mode

- Register with name, email, and password
- Login with email and password
- Password hashing with bcrypt
- JWT auth with 7-day expiry
- `/me` endpoint for restoring authenticated sessions
- Protected transactions while keeping browsing open
- Return URL support after login/register
- Continue as Guest option for demos and frontend-only deployment
- Guest mode allows bidding and Buy Now without the backend

### Responsive UX and Navigation

- Desktop sticky filter sidebar
- Mobile/tablet filter drawer
- Mobile bottom navigation with Inventory, Saved, Bids, and List Car
- Count badges for saved vehicles and bids
- Sticky header with compact navigation
- Dark mode support across the main buyer flows

---

## Backend API

The backend is intentionally small and focused on authentication.

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a user, hash password, return JWT |
| `POST` | `/api/auth/login` | Validate credentials, return JWT |
| `GET` | `/api/auth/me` | Return current authenticated user |

SQLite stores users in `data/users.db`. The table is created automatically on server startup.

Environment variables:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | API server port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed frontend origin |
| `JWT_SECRET` | dev fallback | Secret used to sign JWTs |

For production, `JWT_SECRET` should be set explicitly.

---

## Data and State

- Vehicle data lives in `data/vehicles.json` and is imported through `src/data/vehicles.ts`
- Auction dates are normalized relative to the current time so demos always include upcoming, live, ending-soon, and ended auctions
- Bids are stored in `localStorage` under `the-block:bids`
- Watchlist is stored under `the-block:watchlist`
- Settings are stored under `the-block:settings`

---

## Product Thinking

I tried to make the prototype feel like something a buyer could actually use, not just a table of auction data.

- **Low-friction discovery:** buyers can browse, search, filter, save, and compare before being asked to create an account.
- **Trust around high-intent actions:** bidding and Buy Now both use validation and confirmation steps because accidental auction actions are costly.
- **Mobile buyer behavior:** saved vehicles, My Bids, filter drawer, and the bottom navigation are designed for checking auctions quickly from a phone.
- **Shareability:** detail pages include a WhatsApp share action because car buying is often collaborative. A buyer may want to send a listing to a partner, friend, or mechanic before bidding.
- **Demo resilience:** guest mode keeps the full buyer journey available even when the backend is not running or the app is deployed as a frontend-only Vercel build.
- **Return-path auth:** login/register flows send users back to the vehicle they were trying to bid on instead of dropping them at a generic page.

---

## Notable Decisions

**Auth gated on transactions, not browsing.** Anyone can browse, search, filter, inspect, save, and compare vehicles. Auth is required only when the user tries to bid or buy.

**Guest mode for resilient demos.** The deployed frontend remains useful even when the API is not available. Users can continue as guest and still exercise the main auction flow.

**WhatsApp sharing on vehicle detail.** I added direct sharing because a vehicle purchase usually involves quick second opinions. It is a small feature, but it reflects how users actually evaluate expensive listings.

**URL-driven saved view.** The saved inventory view is controlled by `?saved=1`, which makes it shareable and prevents nav state from drifting away from page state.

**Local optimistic bid state.** Bids update immediately across the app without waiting for a server round trip. This keeps the prototype fast and makes the buyer flow easy to demo.

**Null-safe vehicle fields.** Reserve prices and current bids can be `null`, so bid, reserve, sort, and display logic handles those cases directly instead of relying on coercion.

**Market value badge.** Current bids are compared against peer vehicles by body style and fuel type. Listings below the peer median are marked as stronger opportunities, while high bids are called out.

**Comparison diff extraction.** The compare drawer uses comparison values for JSX-rendered rows so meaningful fields can still be highlighted.

**No external state library.** React state, context, hooks, and memoized pure utilities are enough for this data size and keep the implementation easy to inspect.

---

## Verification

Automated tests:

```bash
npm test
```

The current Vitest suite covers bid validation, auction status/countdown logic, inventory filtering/counts, and sorting behavior.

Current production build check:

```bash
npm run build
```

This runs TypeScript project references and the Vite production build.

Manual flows to test:

- Browse inventory, search, filter, sort, and clear filters
- Save vehicles and open `/?saved=1`
- Compare two vehicles and expand the comparison drawer
- Open a vehicle detail page and use the gallery
- Continue as guest, place a bid, and confirm it appears on `/bids`
- Use Buy Now and confirm the purchased state
- Toggle dark mode, currency, and locale
- Register/login with the API running through `npm run dev:full`
- Submit a vehicle through `/submit`

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                    Browser                       │
│                                                  │
│   React + Vite + TypeScript + Tailwind CSS v4    │
│                                                  │
│   ┌──────────────┐    ┌──────────────────────┐   │
│   │  React State │    │     localStorage     │   │
│   │  + Context   │    │  bids · watchlist    │   │
│   │  (no Redux)  │    │  dealers · settings  │   │
│   └──────────────┘    └──────────────────────┘   │
│                                                  │
│   static vehicle data loaded from vehicles.json  │
└──────────────────┬──────────────────────────────┘
                   │ JWT Bearer (auth only)
                   ▼
┌─────────────────────────────────────────────────┐
│               Express API  :3001                 │
│                                                  │
│   POST /api/auth/register                        │
│   POST /api/auth/login                           │
│   GET  /api/auth/me                              │
│                                                  │
│   bcrypt password hashing · JWT (7-day expiry)   │
└──────────────────┬──────────────────────────────┘
                   │ better-sqlite3
                   ▼
┌─────────────────────────────────────────────────┐
│              SQLite  data/users.db               │
│                                                  │
│   users (id, name, email, password_hash,         │
│           created_at)                            │
└─────────────────────────────────────────────────┘
```

**Buyer flow — from landing to bid:**

```
Browse inventory → Search / Filter / Sort
        │
        ▼
   Vehicle card ──► Save to watchlist
        │
        ▼
   Detail page ──► Image gallery · Specs · Condition report
        │
        ▼
   Bid panel
        │
        ├── Not logged in ──► Login / Register / Guest
        │                              │
        │◄─────────────────────────────┘
        │
        ├── Enter amount ──► Validation (≥ minimum increment)
        │
        ├── Confirm step ──► Bid placed (optimistic, localStorage)
        │
        └── Buy Now ──► Confirm ──► Purchased
                                        │
                                        ▼
                               /bids  (Active · Won · Lost · Purchased)
```

---

## Time Spent

Up to 7 hours total. I started with the inventory and detail pages, then layered in bidding, auth, comparison, notifications, settings, mobile UX, and polish.

---

## Assumptions and Scope

**Included:**
- Full buyer flow: browse, inspect, bid, Buy Now, track outcomes, save, compare
- Auth with register, login, and guest mode for frontend-only demos
- Seller listing form with validation (no backend persistence — form submits locally)
- Mobile layout with bottom navigation
- Dark mode, CAD/USD currency, and EN/FR locale

**Simplified:**
- Vehicle data is static JSON (200 generated listings). In production this would be a live database.
- Bid state is client-side only (`localStorage`). Bids do not persist to the server or compete with other users.
- Auction timers are normalized relative to the current time so demos always show a mix of live, upcoming, and ended auctions — they do not run on a real clock.
- The backend is auth-only. Vehicle inventory, bids, and submissions are not persisted server-side.

**Skipped:**
- Real-time updates (WebSockets / SSE)
- Seller dashboard or admin view
- Payment or escrow flow
- Proxy bidding with automatic increments
- Image upload on vehicle submission

---

## What I'd Do With More Time

**Photo uploads on vehicle listings**
The submit form currently collects vehicle details but no images. I would add image upload directly in the listing flow — drag-and-drop or camera on mobile, stored server-side (S3 or equivalent), with a thumbnail preview before submission. Photos are the highest-signal input for buyers evaluating a used vehicle remotely.

**Real auth with persistent sessions**
Login and register work end-to-end when the backend is running, but bids and watchlist stay in `localStorage` and do not follow the user across devices. I would wire bids and saved vehicles to the backend so a buyer's session is consistent whether they are on their phone or desktop.

**Dealer followers**
A dealer follow system backed by a server-side followers table, so buyers receive in-app notifications when a followed dealer lists new inventory — turning a one-time browse into a recurring relationship.

**Vehicle swap listings**
Alongside cash auctions, sellers often want to trade rather than sell outright. I would add a swap flag on listings where a seller specifies what they are looking for, and buyers can propose their own vehicle in exchange. This opens a different kind of transaction that auction-only platforms do not support.

**Smart matching from click and preference signals**
The current inventory is a flat list. With more time I would track implicit signals — vehicles viewed, saved, time spent on detail pages, bids placed — and use them to rank inventory for each buyer. A returning buyer who consistently looks at low-mileage SUVs under $30K should see those first, not whatever sorted highest. This is the layer that turns a marketplace into something that feels personalized.

**Real-time bid updates**
Bids are currently optimistic and local. In a real auction, other buyers are bidding simultaneously. I would add WebSockets or server-sent events so the current bid and bid count refresh live on the detail page and inventory cards without a manual reload.

**Interactive map for vehicle locations**
Listings currently show city and province as text. An interactive map layer — clustering vehicle pins by region, filterable by auction status — would let buyers visually browse inventory by geography and identify nearby vehicles without reading through cards. Especially useful for buyers who factor in transport cost or want to inspect before bidding.

**AI assistant for buyers**
An in-app assistant that answers natural-language questions about a specific listing ("Is this a good deal for a 2020 RAV4 in Ontario?" or "What should I know about rebuilt titles?") and surfaces relevant inventory based on what the buyer describes. Buyers on high-stakes purchases tend to trust a conversational recommendation loop more than a filter panel, and an assistant lowers the barrier for first-time auction buyers who are unsure how the process works.

**Social layer — follow buyers and sellers, in-app chat**
Buyers could follow dealers they trust and receive a notification when that dealer lists new inventory. Sellers could follow active buyers to understand demand. Direct in-app messaging between a buyer and a followed dealer — asking about a vehicle's history, negotiating a reserve, or coordinating inspection — would bring the relationship that currently happens over phone or WhatsApp inside the platform where it can be tracked and trusted.

**Broader test coverage**
- Vitest unit tests for price insight, settings, and null-field edge cases
- Playwright end-to-end flows covering browse → filter → bid → My Bids outcome
