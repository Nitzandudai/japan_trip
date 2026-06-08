# Supabase Setup

This app uses Supabase as a shared cloud database so the same trip data
shows up on every browser, phone, and family member's device.

## 1. Create the tables (one-time)

In your Supabase project → **SQL editor** → New query → paste this and **Run**:

```sql
-- Places (one row per place)
create table if not exists public.places (
  id text primary key,
  mode text not null,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists places_mode_idx on public.places (mode);

-- Trip metadata (days + seed version, one row per mode)
create table if not exists public.trip_meta (
  mode text primary key,
  days jsonb,
  seed_version text,
  updated_at timestamptz not null default now()
);

-- Allow the anon (publishable) key to read & write.
-- This is a personal family planner, so we use a simple permissive policy.
-- If you ever want to restrict to certain users, switch to Supabase Auth
-- and update these policies.
alter table public.places    enable row level security;
alter table public.trip_meta enable row level security;

drop policy if exists "places anon all"    on public.places;
drop policy if exists "trip_meta anon all" on public.trip_meta;

create policy "places anon all"
  on public.places for all
  to anon
  using (true) with check (true);

create policy "trip_meta anon all"
  on public.trip_meta for all
  to anon
  using (true) with check (true);
```

## 2. Environment variables

Create `.env.local` in the project root (already in `.gitignore`):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...   # the publishable / anon key
```

**Never** put the `service_role` key or DB password here — those bypass
all security and would let anyone with the site URL wipe your data.

## 3. Run the app

```
npm run dev
```

On first launch, if this browser already had data in `localStorage`, the
app will upload it to Supabase automatically (see `[migration]` log in the
browser console). After that, all reads and writes go through Supabase
and every device sees the same data.

## 4. Security notes

- The **anon / publishable key** is safe to expose to the browser — that's
  what it's for. Anyone who visits the deployed site will use it.
- With the permissive RLS policy above, anyone who knows the site URL can
  read and write places. That's fine for a private family trip planner;
  do not store anything sensitive.
- If the URL or key ever leaks publicly and you want to lock it down,
  rotate the anon key in Supabase → Settings → API and add Supabase Auth.
- The **DB password** (the one in `postgresql://postgres:...`) is for
  direct database access only — it is **not** used by this app and should
  never be put in `.env.local` or committed anywhere. If it leaked, rotate
  it in Supabase → Settings → Database → Reset database password.
