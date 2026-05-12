# The Block — OPENLANE Auction Platform

A buyer-side vehicle auction prototype built for the OPENLANE coding challenge.

---

## How to Run

**Requirements:** Node.js 18+

```bash
git clone https://github.com/jamamv/the-block.git
cd the-block
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The app runs entirely in the browser — no backend, no environment variables needed.

To build for production:

```bash
npm run build
npm run preview
```

---

## Stack

- **Framework:** React 18 + Vite 8
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **State:** React `useState` + `useMemo` — no external state library
- **Persistence:** `localStorage` for bid state across sessions

---

## What I Built

A responsive web app covering the full buyer journey: browsing 200 vehicles, inspecting details, placing bids, and tracking active bids.

**Inventory page**
- Search across make, model, VIN, and lot number
- Filter sidebar: make (15), body style, title status, province (7)
- Sort by current bid, year, odometer, or condition grade
- Responsive card grid with condition bar, bid count, and reserve status
- Live auction status badges (Live / Ending Soon / Upcoming / Ended) on every card

**Detail page**
- 4-photo image carousel with thumbnail strip
- Full specs grid and condition panel with damage notes
- Sticky bid panel: validates increment, shows reserve and buy-now price, dealer info
- Auction countdown timer (live-normalized relative to "now")
- Breadcrumb navigation back to inventory

**Bidding**
- Minimum increment of $500 enforced with inline validation
- Confirmation step before a bid is submitted — prevents accidental bids
- Bid state persisted to `localStorage` — bids survive a page refresh
- Bid count and current bid update immediately on the card and detail panel

**Buy Now**
- Vehicles with a buy-now price show a dedicated Buy Now button
- Confirmation step before purchase locks in the price

**My Bids**
- Header badge shows active bid count at a glance
- Dropdown panel lists every vehicle you've bid on with current bid, reserve status, and auction countdown
- Direct link to each vehicle detail page

---

## Notable Decisions

**Bid state at the app root.** I lifted bid state to `App` via a `useBidState` hook rather than managing it locally in each page. This means the inventory cards reflect bids you've placed without needing a round-trip to a server — important for the "updated visible state" requirement.

**No external state library.** `useMemo` for the filter/sort pipeline is fast enough for 200 records and keeps the dependency footprint minimal. I'd reach for Zustand or React Query if the dataset scaled or if we added real API calls.

**Filter and sort are decoupled.** Filtering narrows the set, sorting orders it. Both are pure functions in `src/utils/` that are easy to test and extend independently.

**Tailwind v4 with the Vite plugin.** The `@tailwindcss/vite` plugin means no `tailwind.config.js` to maintain — CSS is generated from usage at build time. Slightly newer approach but cleaner for a greenfield project.

**LocalStorage for persistence.** Keeps the prototype self-contained. The `useBidState` hook wraps reads/writes so swapping in a real API later is a one-file change.

**Bid and Buy Now confirmation.** Both actions require a confirmation step before committing. In an auction context, an accidental bid is hard to undo — a one-step confirmation costs almost nothing and meaningfully increases trust.

**TypeScript strict mode.** `noUnusedLocals`, `noUnusedParameters`, and `verbatimModuleSyntax` are all on. A bit more upfront discipline but the codebase stays clean as it grows.

---

## Assumptions and Scope

- Frontend-only — no auth, no backend, no payments
- Auction timestamps in the dataset are synthetic; I display them as-is in the detail page auction section
- Placeholder images from `placehold.co` are used as-is — a real build would swap these for CDN-hosted photos
- The bid flow is optimistic by design: a placed bid is accepted immediately with no server validation

---

## Time Spent

Approximately 5–6 hours, within the suggested 4–8 hour window.

- ~1h scaffolding (Vite config, TypeScript, Tailwind, routing)
- ~1.5h inventory page (filter/sort pipeline, card design)
- ~2h detail page (gallery, specs, condition panel, bid panel)
- ~1h polish and responsive layout
- ~0.5h README and cleanup

---

## What I'd Do With More Time

- **Price range filter** — min/max bid slider to complement the existing filters
- **Skeleton loading states** — replace blank grid gaps during initial render
- **Keyboard navigation** in the image gallery
- **Accessibility audit** — ARIA labels are minimal; a production build would need a proper pass
- **Outbid notifications** — toast when another buyer surpasses your bid (would need a polling layer or websocket)
