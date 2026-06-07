# Japan Trip Planner

A mobile-friendly React + TypeScript + Vite app for planning a trip to Japan.
Places appear on an interactive Leaflet map and in a synchronized table view —
selecting one highlights it in the other.

## Features

- Interactive Leaflet map with category-colored markers (🍣 food, ⛩️ culture, 🌳 nature, …)
- Synchronized list/table view (mobile: tab toggle; desktop: side-by-side)
- Filter by **category, city, trip day, reservation status, priority**, plus free-text search
- Per-day tabs with counts; separate **Spare time** bucket
- Reservation tracking: required / booked / link to ticket or booking page
- Add / edit / delete places via a modal form
- LocalStorage persistence today; storage layer designed to swap to Supabase later
- Mobile-first responsive layout

## Run it

```powershell
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:5173).

## Switching to Supabase later

The store talks to a `StorageAdapter` defined in [src/lib/storage.ts](src/lib/storage.ts).
A commented `supabaseAdapter` sketch is included — create `places` and `trip_days`
tables matching the [`Place`](src/types.ts) and [`TripDay`](src/types.ts) types,
install `@supabase/supabase-js`, set `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY`, then swap `localStorageAdapter` for `supabaseAdapter` in
[src/store/usePlanner.ts](src/store/usePlanner.ts).

## Project layout

- [src/types.ts](src/types.ts) — domain types (mirrors the planned DB schema)
- [src/data/seed.ts](src/data/seed.ts) — sample places & 10-day itinerary
- [src/lib/storage.ts](src/lib/storage.ts) — swappable persistence adapter
- [src/store/usePlanner.ts](src/store/usePlanner.ts) — Zustand store + selectors
- [src/components/MapView.tsx](src/components/MapView.tsx) — Leaflet map
- [src/components/ListView.tsx](src/components/ListView.tsx) — table view
- [src/components/Filters.tsx](src/components/Filters.tsx) — filter controls
- [src/components/DayTabs.tsx](src/components/DayTabs.tsx) — quick day filter
- [src/components/PlaceDetails.tsx](src/components/PlaceDetails.tsx) — selected place panel
- [src/components/PlaceForm.tsx](src/components/PlaceForm.tsx) — create / edit modal
