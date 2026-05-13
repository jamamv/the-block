# The Block — Vehicle Auction Platform

A buyer-side vehicle auction prototype built for the OPENLANE coding challenge.

![The Block](public/the_block_repo.png)

---

## Live Demo

Deployed on Vercel — **frontend works fully without the backend** (guest mode available).

---

## How to Run

**Requirements:** Node.js 18+

```bash
git clone https://github.com/jamamv/the-block.git
cd the-block
npm install
npm run dev:full     # starts frontend (5173) + API server (3001) together
```

Frontend only (no auth, browse/compare/watchlist still work):
```bash
npm run dev
```

Production build:
```bash
npm run build
npm run preview
```

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite 8 + TypeScript (strict) |
| Styling | Tailwind CSS v4 (Vite plugin, no config file) |
| Routing | React Router v7 |
| Backend | Node.js + Express |
| Auth | bcrypt + JWT + SQLite (better-sqlite3) |
| Persistence | localStorage for bids, watchlist, followed dealers |
| Deployment | Vercel (frontend) |

---

## What I Built

A full buyer-side auction experience across four flows: **browse → inspect → bid → track**.

### Inventory
- Search across brand, model, VIN, lot number, fuel type, body style, city
- Predictive search suggestions: brand shortcuts, body type, auction status, fuel type
- Sidebar filter panel: auction status (live/ending-soon/upcoming/ended), brand, body style, title status, province — with live counts
- 5 sort options: highest bid, lowest bid, newest, low mileage, best condition
- Card grid with condition bar, bid/reserve status, market value badge (Great Deal / High Bid)
- Side-by-side vehicle comparison drawer (up to 2 vehicles) with diff highlighting
- Watchlist (heart button per card, persisted to localStorage)
- Saved view via URL param `/?saved=1` — shareable, bookmarkable

### Detail Page
- 4-photo image gallery with thumbnail strip
- Full specs grid, condition report, damage notes
- Auction countdown (live, 30s tick)
- Bid panel: $500 minimum increment, inline validation, confirmation step
- Buy Now with confirmation step
- Reserve price display and met/not-met indicator
- Verified dealer badge (dealers with ≥5 listings) + Follow button (localStorage)
- Retract bid flow with confirm prompt

### My Bids
- Dedicated `/bids` page with per-vehicle outcome states: **Active / Won / Lost / Purchased**
- Won (green border + trophy badge) when auction ended and reserve was met
- Lost (grayscale thumbnail, "Reserve not met" badge) when reserve wasn't met
- Retract active bids or remove ended ones
- Subtitle shows counts: "2 active · 1 won · 1 not sold"

### Notifications & UX
- Bell icon with unread count — alerts for bids ending soon and watchlist auctions going live
- Mobile bottom tab bar (Inventory / Saved / Bids / List Car) with count badges
- Responsive layout with mobile filter drawer and desktop sidebar
- "Continue as Guest" on login — bypasses auth for demo/Vercel deployment

### Auth
- Register / login with email + password (bcrypt, 12 rounds)
- JWT tokens (7-day expiry), verified on protected routes
- Bid and Buy Now gated — unauthenticated users see a sign-in prompt with return-URL redirect
- Guest mode: works fully when backend is unavailable (e.g., Vercel deployment)

### Submit a Car
- Frontend form with validation: vehicle details, location, auction pricing, condition notes
- Success screen on submit

---

## Notable Decisions

**URL as single source of truth for saved/watchlist view.** The `?saved=1` param drives the filter so the nav toggle and inventory filter are always in sync — no separate state to desync. Shareable and survives navigation.

**Null-safe data layer.** 60 of 200 vehicles have `null` reserve prices; 112 have no current bids. Typed both fields as `number | null` and fixed every callsite (sort comparisons, `formatCurrency` calls, reserve-met logic) rather than masking with implicit coercion.

**Market value badge.** Each vehicle's current bid is compared to the median bid for its body style + fuel type. Vehicles more than 13% below median get "Great Deal"; more than 13% above get "High Bid". Cache key includes `current_bid` so the badge updates immediately after bidding.

**Compare drawer diff highlighting.** The side-by-side comparison highlights differing rows in amber. JSX-rendered rows (bid, condition, auction status) use a `cmp` extractor instead of stringifying React elements — `String(<Component />)` always returns `[object Object]` and would never diff correctly.

**No external state library.** `useMemo` over a pure filter/sort pipeline is fast enough for 200 records and keeps the bundle lean. Lifting bid state to the app root means cards update immediately without server round-trips.

**Bid and Buy Now confirmation steps.** An accidental bid in an auction is essentially irreversible — the one-step modal costs nothing and meaningfully increases trust.

**Auth gated on transactions, not browsing.** Anyone can browse, search, compare, and inspect without an account. Auth is only required to place a bid or buy now.

---

## Time Spent

~12–15 hours total, built iteratively. Started with inventory and detail pages, then layered in bidding, auth, comparison, notifications, mobile UX, and polish. Gorilla-tested at the end to catch null-safety bugs and stale cache issues before push.

---

## What I'd Do With More Time

- **Proxy bidding** — eBay-style max bid ceiling with tiered increments is more realistic than fixed $500 increments
- **WebSocket real-time updates** — bid counts and current prices update across clients without polling
- **Unit tests** — Vitest for filter/sort utilities, bid validation, price insight, and auction status logic
- **E2E tests** — Playwright for full flows: browse → filter → bid → confirm → verify My Bids outcome state
- **Price range slider** — min/max current bid filter to complement the existing sidebar
- **Skeleton loading states** — replace blank grid gaps on initial render
- **Accessibility audit** — ARIA labels, keyboard navigation, focus management in modals and gallery
