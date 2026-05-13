# The Block — Vehicle Auction Platform

A buyer-side vehicle auction prototype built for the OPENLANE coding challenge.

The app focuses on the core buyer journey: browse auction inventory, inspect a vehicle, place a bid or buy now, save and compare listings, and track outcomes from a dedicated bids page.

![The Block](public/the_block_repo.png)

---

## Live Demo

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
| Persistence | localStorage for bids, watchlist, followed dealers, and settings |
| Deployment | Vercel frontend |

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

### Inventory

- 200 generated vehicle listings loaded from local data
- Search across brand, model, VIN, lot number, fuel type, body style, city, province, and dealership
- Predictive search suggestions for brands, body styles, fuel types, and auction states
- Desktop sidebar filters and mobile filter drawer
- Filters for auction status, brand, body style, title status, and province
- Live filter counts
- Sort by highest bid, lowest bid, newest year, lowest mileage, and best condition
- Dismissible banner persisted in `sessionStorage`
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
- Follow/unfollow dealer, persisted to `localStorage`

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
- Alerts are sorted by urgency
- Empty notification state when there is nothing to act on

### Settings and Localization

- Settings popover in the header
- Dark mode toggle persisted to `localStorage`
- Currency toggle between CAD and USD
- Locale toggle between English and French
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

### Submit a Vehicle

- `/submit` form for listing a vehicle
- Fields for identity, body style, fuel, transmission, drivetrain, odometer, condition, title status, location, dealership, auction pricing, Buy Now price, and condition notes
- Inline validation for required fields, year, and condition grade
- Confirmation screen after successful submission

### Responsive UX

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
- Followed dealers are stored under `the-block:followed-dealers`
- Settings are stored under `the-block:settings`

---

## Notable Decisions

**Auth gated on transactions, not browsing.** Anyone can browse, search, filter, inspect, save, and compare vehicles. Auth is required only when the user tries to bid or buy.

**Guest mode for resilient demos.** The deployed frontend remains useful even when the API is not available. Users can continue as guest and still exercise the main auction flow.

**URL-driven saved view.** The saved inventory view is controlled by `?saved=1`, which makes it shareable and prevents nav state from drifting away from page state.

**Local optimistic bid state.** Bids update immediately across the app without waiting for a server round trip. This keeps the prototype fast and makes the buyer flow easy to demo.

**Null-safe vehicle fields.** Reserve prices and current bids can be `null`, so bid, reserve, sort, and display logic handles those cases directly instead of relying on coercion.

**Market value badge.** Current bids are compared against peer vehicles by body style and fuel type. Listings below the peer median are marked as stronger opportunities, while high bids are called out.

**Comparison diff extraction.** The compare drawer uses comparison values for JSX-rendered rows so meaningful fields can still be highlighted.

**No external state library.** React state, context, hooks, and memoized pure utilities are enough for this data size and keep the implementation easy to inspect.

---

## Verification

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

## Time Spent

Around 12-15 hours total. I started with the inventory and detail pages, then layered in bidding, auth, comparison, notifications, settings, mobile UX, and polish.

---

## What I'd Do With More Time

- Proxy bidding with max bid ceilings and tiered increments
- Real-time bid updates through WebSockets or server-sent events
- Persist real bids and vehicle submissions server-side
- Swipe-style discovery for buyers to quickly like, skip, save, or compare vehicles from a mobile-first browsing flow
- Smarter backend matching that uses AI-assisted buyer preferences, seller inventory, budget, location, condition, and bidding behavior to recommend better seller-to-buyer matches
- A fuller follower system where buyers can follow dealers, sellers can build an audience, and followers receive alerts when matching inventory is listed
- Vitest coverage for filtering, sorting, auction status, bid validation, and price insight
- Playwright flows for browse, filter, bid, Buy Now, and My Bids outcomes
- Price range and mileage filters
- Better loading and empty states for async/server-backed data
- Accessibility pass for focus management, modal behavior, keyboard navigation, and screen reader labels
- Code splitting to reduce the single production JS chunk size
