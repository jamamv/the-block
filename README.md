# The Block — Vehicle Auction Platform

A buyer-side vehicle auction prototype built for the OPENLANE coding challenge. It covers the full buyer journey: browse and filter inventory, inspect a vehicle with a gallery and condition report, place a bid with validation and confirmation, buy outright, save and compare listings, and track outcomes on a dedicated bids page. A small Express backend handles auth. The frontend works without it — guest mode keeps the entire flow exercisable from the live deployment.

**Live demo:** https://the-block-omega.vercel.app

---

## Quick Start

**Requirements:** Node.js 18+

```bash
git clone https://github.com/jamamv/the-block.git
cd the-block
npm install
npm run dev:full
```

`npm run dev:full` starts the Vite frontend on `http://localhost:5173` and the Express API on `http://localhost:3001`. Use `npm run dev` for the frontend alone.

---

## What Was Built

**Finding the right vehicle.** The inventory page has to reduce 200 listings to a shortlist without friction. Search works across brand, model, VIN, lot number, fuel type, body style, city, province, and dealership, with predictive suggestions that can update filters directly — searching "electric" narrows fuel type, not just text. Filters cover auction status, brand, body style, fuel type, title status, province, price range, year range, and minimum condition grade (Fair 2.0+, Good 3.0+, Excellent 4.0+). All filters show live counts so buyers know before clicking whether a combination returns results. Sort covers highest bid, lowest bid, newest year, lowest mileage, and best condition. A grid/list toggle lets buyers switch between card view for browsing and a compact row view for scanning more listings at once.

**Evaluating before committing.** Detail pages carry a gallery with thumbnail navigation, a full specs grid, a condition report with numeric grade and damage notes, and a breakdown of auction pricing — starting bid, reserve, and Buy Now — alongside the selling dealer. A verified badge appears for dealers with at least five listings. Reserve status is surfaced on the bid panel and updates once the threshold is crossed, because the difference between "this auction will complete" and "this won't" is exactly what a buyer needs to know before bidding.

**The transaction.** The bid panel validates input, enforces the minimum increment, converts between display currency and internal CAD, and requires a confirmation step before any bid is placed. Buy Now has its own confirmation. Retraction is gated behind a second confirmation. These friction points are deliberate — an accidental bid in an auction is a trust-destroying event, and the confirmation step costs nothing.

**Tracking outcomes.** The bids page shows every vehicle bid on with outcome states: active with live countdown, won, purchased via Buy Now, or lost with reserve-not-met status. Active bids can be retracted; ended records can be removed. A buyer's relationship with an auction doesn't end when they bid — it ends when they know the result.

**Supporting the decision.** Car buying is collaborative, so the detail page has a WhatsApp share button. Watchlist saves vehicles across sessions. Comparison puts two vehicles side by side in a drawer with differing fields highlighted. Notifications surface watched vehicles going live and active bids ending soon.

---

## Key Decisions

**Auth gates identity, not functionality.** Guest and authenticated users have identical bid capabilities because bids live in `localStorage` either way. This was a deliberate call: buyers should experience the full flow before hitting an auth wall, and it keeps the frontend-only deployment genuinely useful for demos. The cost is real — a guest's bids don't follow them across devices, and clearing storage loses bid history. That's the known gap, and it's a wiring decision not an architectural one. The fix is straightforward: wire `useBidState` and `useWatchlist` to the API behind JWT, and auth becomes meaningful.

**Bid state is reactive and centralised.** `bidStateMap` in `App.tsx` is React state keyed by vehicle ID. Every inventory card reads from the map rather than static JSON, so placing a bid updates the card count and current bid immediately without a page reload. A bug caught during development: `bid_count` was incrementing from 0 instead of seeding from `vehicle.bid_count`, so a vehicle with five existing bids showed "1 bid" after your first. Fixed. Re-bids don't double-count.

**Auction status is a single source of truth.** All auction timing — status classification, countdown text, bid form gating — flows through `utils/auction.ts`. The same function drives inventory card badges, filter counts, the detail page header, notifications, and the bid panel. Ended and upcoming auctions disable the bid form entirely. If the logic changes, it changes once.

**Reserve logic treats null as a first-class state.** No-reserve vehicles show "No reserve." The Reserve Met / Not Met indicator only appears when `reserve_price` is non-null. Showing "Reserve Not Met" on a vehicle with no reserve would be a factual contradiction on a high-stakes decision screen.

**i18n is either complete or not shipped.** The EN/FR toggle covers every visible string through the `t()` helper — filter labels, error messages, badges, confirmation copy, countdown text. Partial i18n, where half the UI translates and the other half stays in English, is more disorienting than no toggle at all. Utility functions that produce copy outside React components accept an optional `t` parameter defaulting to English, so tests don't require a context provider.

**Comparison is capped at two vehicles.** Side-by-side in a bottom drawer works cleanly at two. Three vehicles requires a full table layout and a different interaction model. The constraint is a design decision, not a technical one.

**URL-driven saved view.** The saved inventory view is `/?saved=1` rather than component state. It's shareable, bookmarkable, and prevents navigation state from drifting away from page state on refresh.

---

## Known Gaps

Bids are `localStorage` only. Two tabs are out of sync, and clearing storage loses bid history. This is the main gap between the prototype and a real implementation — server-persisted bids behind JWT closes it, and the architecture is ready for it.

The `/submit` form validates and confirms locally but does not persist to the backend. It demonstrates the seller-side flow without the infrastructure.

There are no real-time updates. Bid counts reflect state at page load and update when bids are placed locally, but don't reflect other users' activity without a reload.

---

## What's Next

- **Wire bids and watchlist to the backend.** This closes the auth gap and makes sessions meaningful across devices. Everything downstream depends on bids being real data.
- **Real-time bid updates via WebSockets or SSE.** Bid counts and current bids on the detail page should reflect live activity from other buyers.
- **Image upload on `/submit`.** Photos are the highest-signal input for a remote buyer — drag-and-drop to S3 with a thumbnail preview before submission.
- **Playwright end-to-end coverage.** Browse → filter → bid → My Bids outcome. The unit tests cover business logic; the missing layer is full-flow confidence.
- **Interactive map.** Cluster vehicle pins by region, filterable by auction status. Buyers who factor in transport cost or want to inspect in person need geography, not just city text.
- **AI assistant.** Natural-language Q&A on specific listings — "Is this a good deal for a 2020 RAV4 in Ontario?" or "What should I know about a rebuilt title?" Buyers on high-stakes purchases trust a conversational loop more than a filter panel, and it lowers the barrier for first-time auction buyers.
- **Social layer — follows and in-app chat.** Buyers follow dealers they trust and get notified when new inventory lands. Direct messaging between buyer and seller keeps the conversation on the platform instead of moving to WhatsApp, where it can't be tracked or trusted.

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
| Deployment | Vercel |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite frontend |
| `npm run server` | Start the Express API server |
| `npm run dev:full` | Start frontend and API together |
| `npm test` | Run the Vitest utility test suite |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |

---

## AI Usage

AI tools were used throughout — for UI prototyping, architecture review, and implementation. The product decisions, scope tradeoffs, bug identification, and walkthrough understanding are mine.
