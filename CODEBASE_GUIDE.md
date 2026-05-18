# Codebase Guide

This document explains how the project is put together and what each important file does. It is meant as a walkthrough aid: start with the big picture, then use the file-by-file notes when you need to explain implementation details.

---

## Big Picture

The Block is a React/Vite auction marketplace prototype with a small authentication backend. The frontend owns the buyer experience: inventory browsing, filters, saved vehicles, comparison, detail pages, bidding, Buy Now, My Bids, notifications, settings, and seller listing submission.

The app is intentionally optimized for a reliable demo:

- Vehicle data is local and deterministic.
- Bids, saved vehicles, followed dealers, guest mode, and settings are stored in `localStorage`.
- Auth can run through the Express server locally or serverless functions on Vercel.
- Guest mode keeps the main buyer flow usable even if the backend is unavailable.
- Utility tests cover the core business rules.

---

## Runtime Flow

1. `index.html` provides the root `<div id="root">`.
2. `src/main.tsx` mounts the React app in `StrictMode`.
3. `src/App.tsx` creates global state with hooks:
   - `useAuth`
   - `useBidState`
   - `useWatchlist`
4. `SettingsProvider` wraps the app and provides dark mode, currency, locale, `fmt(...)`, and `t(...)`.
5. `BrowserRouter` controls routes:
   - `/` inventory
   - `/vehicle/:id` detail page
   - `/bids` bid tracking
   - `/submit` seller listing form
   - `/login` and `/register`
6. Feature pages use shared utilities for filtering, sorting, auction status, price insights, bid validation, and formatting.
7. Local state changes are lifted high enough that inventory cards, detail pages, notifications, and My Bids stay in sync.

---

## Frontend Entry Points

### `index.html`

The Vite HTML shell. It defines the page metadata and the `root` element where React mounts.

### `src/main.tsx`

Imports global CSS and renders `<App />` into `#root`. This is the only place React is mounted.

### `src/App.tsx`

The top-level application shell.

Key responsibilities:

- Creates the app-wide bid, auth, and watchlist state.
- Wraps the app in `SettingsProvider` and `BrowserRouter`.
- Composes layout components (`Header`, `BottomNav`) and route components.
- Keeps saved and bids navigation state tied to the current URL.

Important internal pieces:

- `AppShell` binds route components to shared state and callbacks.
- Layout components live in `src/components/layout/` and are imported here.

---

## Layout Components

### `src/components/layout/Header.tsx`

Desktop header and navigation.

Responsibilities:

- Brand logo and nav links (Inventory, Saved count, Bids count, List Car).
- Live auction badge (pulses when any auction is active or ending soon).
- Notification bell via `NotificationBell`.
- Settings popover via `SettingsPopover`.
- Auth controls via `UserMenu`.

Contains `useHasLiveAuctions()` — a local hook that checks whether any vehicle is currently live or ending soon.

### `src/components/layout/BottomNav.tsx`

Mobile bottom navigation bar with four tabs: Inventory, Saved, Bids, and List Car.

### `src/components/layout/SettingsPopover.tsx`

Dropdown for dark mode, CAD/USD currency, and English/French locale toggles.

### `src/components/layout/UserMenu.tsx`

Shows the logged-in user's initials as an avatar. Opens a small menu with a logout action.

### `src/components/layout/LoadingScreen.tsx`

Full-screen loading state shown while auth is initializing.

---

## Data and Types

### `data/vehicles.json`

The generated vehicle dataset used by the prototype. It includes listing details, condition data, location, auction dates, bids, reserves, images, and dealer names.

### `src/data/vehicles.ts`

Loads `vehicles.json` and exports useful derived collections:

- `vehicles`: typed vehicle array
- `getVehicleById(...)`: lookup helper for detail pages, bids, and compare views
- `ALL_BrandS`, `ALL_BODY_STYLES`, `ALL_PROVINCES`: filter option lists
- `VERIFIED_DEALERS`: dealers with at least five listings

### `src/types/vehicle.ts`

Central TypeScript model definitions:

- Vehicle fields and union types
- Bid state shape
- Filter state shape
- Auction status filter values
- Sort keys

This file is useful in interviews because it shows the domain model clearly.

### `src/vite-env.d.ts`

Vite TypeScript environment declarations.

---

## API Client and Auth State

### `src/lib/api.ts`

Frontend API wrapper for auth.

Responsibilities:

- Stores and clears JWT tokens in `localStorage`.
- Stores and clears guest sessions.
- Sends authenticated requests to `/api/...`.
- Handles register, login, and `/me`.
- Falls back to guest mode when the backend is unavailable in demo/frontend-only contexts.

Important idea: failed network or JSON parsing errors can indicate the backend is missing, so the app gracefully continues as guest.

### `src/hooks/useAuth.ts`

React hook that owns the authenticated user state.

It:

- Restores guest sessions.
- Restores JWT sessions through `apiMe()`.
- Exposes `login`, `register`, `loginAsGuest`, and `logout`.
- Clears invalid tokens if `/me` fails.

---

## App State Hooks

### `src/hooks/useBidState.ts`

Owns local bid state.

It exposes:

- `bidStateMap`
- `placeBid(vehicleId, amount)`
- `buyNow(vehicleId, price)`
- `retractBid(vehicleId)`

Bids are persisted to `localStorage` under `the-block:bids`. This lets the prototype update immediately across inventory cards, detail pages, notifications, and My Bids.

### `src/hooks/useWatchlist.ts`

Stores saved vehicle IDs in a `Set`.

It exposes:

- `watchlist`
- `toggleWatch(id)`

Persistence key: `the-block:watchlist`.

### `src/hooks/useFollowedDealers.ts`

Stores followed dealer names in a `Set`.

It exposes:

- `followedDealers`
- `toggleFollow(name)`

Persistence key: `the-block:followed-dealers`.

### `src/hooks/useComparison.ts`

Manages the two-car comparison selection.

It exposes:

- `compareIds`
- `toggleCompare(id)`
- `removeCompare(id)`
- `clearCompare()`
- `canAdd(id)`

The max comparison size is two vehicles.

### `src/hooks/useNotifications.ts`

Builds notification data from bids, watchlist, and auction status.

Notification types:

- `bid-ending`
- `watchlist-live`
- `watchlist-ending`

Notifications are sorted by urgency so active bids come first.

### `src/hooks/useNow.ts`

A shared clock hook based on `useSyncExternalStore`. It updates subscribers every 30 seconds without every component needing its own timer.

### `src/hooks/useAuctionStatus.ts`

Combines the shared `useNow()` clock with auction utilities.

It returns:

- normalized auction start
- auction status
- countdown text

---

## Settings and Localization

### `src/contexts/SettingsContext.tsx`

Provides app settings through React context.

State:

- `darkMode`
- `currency`
- `locale`

Exposes:

- `toggleDark()`
- `setCurrency(...)`
- `setLocale(...)`
- `fmt(amount)`
- `t(key, vars?)`

Dark mode is applied by adding/removing the `dark` class on `document.documentElement`. Settings are stored in `localStorage` under `the-block:settings`.

### `src/utils/i18n.ts`

Defines English and French translation dictionaries and exports `getT(locale)`.

The returned `t(...)` helper supports simple variable replacement like `{ amount }`.

### `src/utils/format.ts`

Formatting helpers:

- `formatCurrency(...)`
- `formatOdometer(...)`
- `conditionLabel(...)`
- `conditionColor(...)`
- `titleStatusLabel(...)`
- `bodyStyleLabel(...)`
- `formatLot(...)`

Currency currently supports CAD and USD with a fixed conversion rate for demo purposes.

---

## Inventory Feature

### `src/components/inventory/InventoryPage.tsx`

Main inventory route.

Responsibilities:

- Reads query params for search and saved-only mode.
- Owns active filters and sort key.
- Applies `filterVehicles(...)` then `sortVehicles(...)`.
- Filters to watchlist when `?saved=1` is active.
- Shows desktop sidebar filters and mobile drawer filters.
- Shows search input and predictive suggestions.
- Renders vehicle cards.
- Owns comparison drawer state through `useComparison`.
- Shows followed dealer shortcuts in the sidebar.

### `src/components/inventory/FilterPanel.tsx`

Reusable filter panel used in the desktop sidebar and mobile drawer.

Filter groups:

- Auction status
- Brand
- Body style
- Title status
- Province

It computes and displays live counts for each facet.

### `src/components/inventory/SearchSuggestions.tsx`

Predictive suggestions for search.

It suggests:

- Auction statuses like live or ending soon
- Fuel types like electric and hybrid
- Matching brands
- Matching body styles

Some suggestions update filters directly, while others update search intent.

### `src/components/inventory/SortBar.tsx`

Shows inventory count and sort dropdown.

Sort keys:

- Highest bid
- Lowest bid
- Newest
- Low mileage
- Best condition

Labels come from the localization helper.

### `src/components/inventory/VehicleCard.tsx`

Card view for each vehicle.

Shows:

- Main image
- Title/fuel badges
- Watchlist heart
- Auction status
- Lot number
- Vehicle title and trim
- Odometer
- Condition bar
- Bid count
- Reserve met status
- Current bid
- Buy Now price
- Price insight badge
- Compare button

The card links to the detail page, while watchlist and compare buttons stop navigation.

---

## Vehicle Detail Feature

### `src/components/detail/DetailPage.tsx`

Vehicle detail route.

Responsibilities:

- Reads `id` from the route.
- Finds the vehicle.
- Shows breadcrumbs, title, VIN/lot, badges, WhatsApp share, and auction status.
- Lays out image gallery, specs, condition, auction details, and bid panel.
- Passes bid callbacks into `BidPanel`.

### `src/components/detail/ImageGallery.tsx`

Image carousel for vehicle photos.

Features:

- Active image state
- Previous/next buttons
- Thumbnail strip
- Wraparound navigation

### `src/components/detail/SpecsGrid.tsx`

Displays structured vehicle specs such as body style, odometer, drivetrain, transmission, colors, fuel type, location, dealer, and title status.

### `src/components/detail/ConditionPanel.tsx`

Displays condition grade, condition report, and damage notes. It turns the numeric grade into a visual progress bar.

### `src/components/detail/BidPanel.tsx`

The transaction panel for bidding and Buy Now.

Responsibilities:

- Shows current bid, reserve, starting bid, and dealer information.
- Blocks bidding unless the user is signed in or in guest mode.
- Validates bid amount.
- Shows confirmation before placing a bid.
- Shows success state after bidding.
- Supports Buy Now confirmation.
- Supports bid retraction.
- Shows verified dealer and follow/unfollow button.

This is one of the highest-value files to explain because it contains the main auction interaction.

---

## My Bids Feature

### `src/components/bids/BidsPage.tsx`

Dedicated bid tracking route.

Responsibilities:

- Reads all vehicles from `bidStateMap`.
- Computes outcome states:
  - `active`
  - `won`
  - `lost`
  - `purchased`
- Shows active countdowns.
- Shows reserve met/not met.
- Lets users retract active bids or remove ended records.
- Shows a summary subtitle.

The page demonstrates how local bid state becomes a user-facing workflow.

---

## Auth Components

### `src/components/auth/LoginPage.tsx`

Login route.

Features:

- Email/password form
- Loading and error states
- Return URL support after login
- Link to registration
- Continue as Guest action

### `src/components/auth/RegisterPage.tsx`

Registration route.

Features:

- Name/email/password form
- Loading and error states
- Return URL support after register
- Link back to login

---

## Seller Listing Flow

### `src/components/submit/SubmitPage.tsx`

Form for listing a vehicle.

Sections:

- Vehicle identity
- Body/fuel/transmission/drivetrain
- Odometer, condition, title status
- Location and dealership
- Auction pricing
- Condition notes

Validation covers required fields, year range, and condition grade range. Successful submission shows a confirmation screen.

---

## Shared UI Components

### `src/components/ui/Badge.tsx`

Small reusable status badges:

- `TitleBadge`
- `FuelBadge`
- `ConditionBadge`
- `ReserveBadge`

### `src/components/ui/AuctionStatus.tsx`

Visual badge for auction status. It uses `useAuctionStatus(...)` to show labels and countdown text.

### `src/components/ui/NotificationBell.tsx`

Header notification dropdown.

It:

- Shows unread count.
- Opens/closes on click.
- Closes on outside click.
- Displays notification type, image, title, and countdown.
- Links notifications to vehicle detail pages.

### `src/components/ui/CompareDrawer.tsx`

Bottom comparison drawer.

Features:

- Collapsed and expanded modes.
- Two-vehicle comparison.
- Remove and clear controls.
- Spec rows with difference highlighting.
- Special renderers for condition and auction status.

### `src/components/ui/EmptyState.tsx`

Shown when filters/search return no vehicles. Includes a clear-filters action.

### `src/components/ui/MyBidsPanel.tsx`

Older panel-style bid UI. The current app uses the dedicated `/bids` page, but this component shows an alternate drawer/panel implementation for bid tracking.

---

## Utility Functions

### `src/utils/bid.ts`

Bid rules:

- Minimum increment is `$500`.
- `minimumBid(currentBid)` returns the next valid bid.
- `validateBid(amount, currentBid)` returns either an error string or `null`.

### `src/utils/auction.ts`

Auction timing logic.

Important detail: raw auction dates are normalized relative to the current date. This keeps the demo interesting over time by always producing ended, live, ending-soon, and upcoming auctions.

Exports:

- `AUCTION_DURATION_MS`
- `getNormalizedAuctionStart(...)`
- `getAuctionStatus(...)`
- `getCountdownText(...)`

### `src/utils/filter.ts`

Inventory filtering logic.

Responsibilities:

- Default filter state.
- Determine whether any filter is active.
- Filter vehicles by search, auction status, brand, body style, title status, and province.
- Compute facet counts.

### `src/utils/sort.ts`

Inventory sorting logic.

Sorts by:

- Current bid descending
- Current bid ascending
- Year descending
- Odometer ascending
- Condition descending

It prefers local bid state over the original vehicle bid.

### `src/utils/priceInsight.ts`

Computes the Great Deal / Fair Price / High Bid label.

Logic:

- Uses current bid.
- Finds peer vehicles by body style and fuel type.
- Falls back to body style only if there are not enough exact peers.
- Compares current bid against peer median.
- Caches results by vehicle id and current bid.

---

## Tests

### `src/utils/bid.test.ts`

Tests minimum bid and bid validation.

### `src/utils/auction.test.ts`

Tests auction status classification and countdown copy.

### `src/utils/filter.test.ts`

Tests active-filter detection, search, structured facets, and count computation.

### `src/utils/sort.test.ts`

Tests sorting behavior and confirms local bid state overrides original vehicle bids.

Run tests with:

```bash
npm test
```

---

## Backend: Local Express Server

### `server/index.ts`

Local Express API entry point.

Responsibilities:

- Creates the Express app.
- Configures CORS.
- Parses JSON bodies.
- Mounts auth routes under `/api/auth`.
- Starts the local server on `PORT` or `3001`.

### `server/db.ts`

SQLite database setup for local development.

Responsibilities:

- Opens `data/users.db`.
- Enables WAL mode.
- Creates the `users` table if needed.

### `server/routes/auth.ts`

Express auth routes.

Routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

It validates input, hashes passwords with bcrypt, checks credentials, signs JWTs, and returns safe user objects without password hashes.

### `server/middleware/auth.ts`

JWT middleware and token helper.

Responsibilities:

- Defines the JWT secret.
- Requires `JWT_SECRET` in production.
- Adds `req.user` typing to Express.
- Verifies bearer tokens.
- Signs 7-day tokens.

---

## Backend: Vercel Serverless API

### `api/_lib.ts`

Shared helper for Vercel functions.

Responsibilities:

- Lazily creates a SQLite database in `/tmp/users.db`.
- Creates the same `users` table.
- Defines `UserRow`.
- Returns safe user objects.
- Signs and verifies JWTs.

### `api/auth/register.ts`

Serverless registration endpoint.

It mirrors the Express register logic:

- Only accepts `POST`.
- Validates name, email, and password.
- Checks for duplicate email.
- Hashes password.
- Inserts user.
- Returns safe user and JWT.

### `api/auth/login.ts`

Serverless login endpoint.

It:

- Only accepts `POST`.
- Validates email/password presence.
- Looks up user.
- Compares password hash.
- Returns safe user and JWT.

### `api/auth/me.ts`

Serverless current-user endpoint.

It:

- Only accepts `GET`.
- Requires bearer token.
- Verifies token.
- Looks up user.
- Returns safe user.

---

## Styling

### `src/index.css`

Global CSS entry.

Responsibilities:

- Imports Tailwind CSS.
- Defines the custom dark-mode variant.
- Sets global font and page background.
- Adds thin scrollbar utilities.

Most component styling is done with Tailwind classes inside the JSX files.

---

## Build and Configuration

### `package.json`

Defines project scripts, dependencies, and dev dependencies.

Important scripts:

- `npm run dev`
- `npm run server`
- `npm run dev:full`
- `npm test`
- `npm run build`
- `npm run preview`

### `package-lock.json`

Locks exact dependency versions for reproducible installs and CI.

### `vite.config.ts`

Vite configuration.

Responsibilities:

- Enables React plugin.
- Enables Tailwind v4 Vite plugin.
- Proxies `/api` requests to the local Express server during development.

### `tsconfig.json`

Root TypeScript project references file.

### `tsconfig.app.json`

TypeScript config for the frontend app.

Important choices:

- Strict mode.
- No unused locals/parameters.
- JSON imports enabled.
- React JSX transform.

### `tsconfig.node.json`

TypeScript config for Node/Vite config files. In this repo it includes `vite.config.ts`.

### `vercel.json`

Vercel deployment configuration. It rewrites non-API routes to `index.html` so React Router can handle browser refreshes and deep links.

### `.github/workflows/ci.yml`

GitHub Actions workflow.

It runs on pushes and pull requests to `main`, installs dependencies with `npm ci`, and runs the production build.

---

## Scripts and Assets

### `scripts/generate_vehicles.mjs`

Data generation script for creating the vehicle dataset.

### `public/the_block_repo.png`

Project image used in README/documentation.

---

## Documentation Files

### `README.md`

Main project README for reviewers. It explains the product, setup, features, architecture decisions, tests, deployment link, and future improvements.

### `WALKTHROUGH.md`

Explains how to prepare for the 45-60 minute walkthrough conversation.

### `CODEBASE_GUIDE.md`

This file. It is the detailed code walkthrough.

---

## Best Files to Explain in an Interview

If time is limited, focus on these:

1. `src/App.tsx` for app composition, routing, and lifted state.
2. `src/components/inventory/InventoryPage.tsx` for browse/search/filter/sort flow.
3. `src/components/detail/BidPanel.tsx` for the core transaction behavior.
4. `src/components/bids/BidsPage.tsx` for bid outcome logic.
5. `src/hooks/useBidState.ts` for optimistic local bid persistence.
6. `src/utils/auction.ts` for demo-friendly auction timing.
7. `src/contexts/SettingsContext.tsx` for dark mode, currency, and locale.
8. `server/routes/auth.ts` and `api/auth/*.ts` for auth implementation.
9. `src/utils/*.test.ts` for automated coverage of business rules.

---

## Honest Production Notes

This is a strong prototype architecture, but a production auction system would need:

- Server-authoritative bids.
- Concurrency controls for simultaneous bids.
- Audit logs for bid history and retractions.
- Real-time updates through WebSockets or server-sent events.
- Durable database-backed watchlists, follows, notifications, and submissions.
- Payment, fraud, and identity verification flows.
- Stronger accessibility and end-to-end testing.

Those are intentionally out of scope for the time-boxed prototype, but the current separation of components, hooks, utilities, and backend routes leaves a clear path to add them.
