import type { Place, TripDay } from '../types';
import { isSupabaseConfigured, supabase } from './supabase';

// Storage adapter. The localStorage adapter is the fallback / offline copy;
// the Supabase adapter is the shared cloud database (used when env is set).

export type Mode = 'real' | 'demo';

export interface StorageAdapter {
  loadPlaces(mode: Mode): Promise<Place[] | null>;
  savePlaces(mode: Mode, places: Place[]): Promise<void>;
  loadDays(mode: Mode): Promise<TripDay[] | null>;
  saveDays(mode: Mode, days: TripDay[]): Promise<void>;
  loadSeedVersion(mode: Mode): Promise<string | null>;
  saveSeedVersion(mode: Mode, version: string): Promise<void>;
}

const placesKey = (mode: Mode) => `japan-planner.${mode}.places.v1`;
const daysKey = (mode: Mode) => `japan-planner.${mode}.days.v1`;
const seedVersionKey = (mode: Mode) => `japan-planner.${mode}.seedVersion.v1`;

export const localStorageAdapter: StorageAdapter = {
  async loadPlaces(mode) {
    try {
      const raw = localStorage.getItem(placesKey(mode));
      return raw ? (JSON.parse(raw) as Place[]) : null;
    } catch {
      return null;
    }
  },
  async savePlaces(mode, places) {
    localStorage.setItem(placesKey(mode), JSON.stringify(places));
  },
  async loadDays(mode) {
    try {
      const raw = localStorage.getItem(daysKey(mode));
      return raw ? (JSON.parse(raw) as TripDay[]) : null;
    } catch {
      return null;
    }
  },
  async saveDays(mode, days) {
    localStorage.setItem(daysKey(mode), JSON.stringify(days));
  },
  async loadSeedVersion(mode) {
    try {
      return localStorage.getItem(seedVersionKey(mode));
    } catch {
      return null;
    }
  },
  async saveSeedVersion(mode, version) {
    localStorage.setItem(seedVersionKey(mode), version);
  },
};

// ---------------------------------------------------------------------------
// Supabase adapter
// ---------------------------------------------------------------------------
// Schema (run once in Supabase SQL editor — see SUPABASE_SETUP.md):
//
//   create table places (
//     id text primary key,
//     mode text not null,
//     data jsonb not null,
//     updated_at timestamptz not null default now()
//   );
//   create table trip_meta (
//     mode text primary key,
//     days jsonb not null,
//     seed_version text not null,
//     updated_at timestamptz not null default now()
//   );
//
// We store each Place as a single jsonb blob keyed by id+mode, and the days
// + seed version as one row per mode in trip_meta. Simple, no migrations
// needed when the Place shape changes.

interface PlaceRow {
  id: string;
  mode: Mode;
  data: Place;
}

interface TripMetaRow {
  mode: Mode;
  days: TripDay[];
  seed_version: string;
}

export const supabaseAdapter: StorageAdapter = {
  async loadPlaces(mode) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('places')
      .select('data')
      .eq('mode', mode);
    if (error) {
      console.error('[supabase] loadPlaces failed', error);
      return null;
    }
    return (data ?? []).map((row) => (row as { data: Place }).data);
  },

  async savePlaces(mode, places) {
    if (!supabase) return;
    // Strategy: upsert all current places, then delete any row whose id is
    // not in the current set. Keeps the table mirroring the in-app state.
    if (places.length > 0) {
      const rows: PlaceRow[] = places.map((p) => ({ id: p.id, mode, data: p }));
      const { error } = await supabase.from('places').upsert(rows);
      if (error) {
        console.error('[supabase] savePlaces upsert failed', error);
        return;
      }
    }
    const keepIds = places.map((p) => p.id);
    let del = supabase.from('places').delete().eq('mode', mode);
    if (keepIds.length > 0) {
      del = del.not('id', 'in', `(${keepIds.map((id) => `"${id}"`).join(',')})`);
    }
    const { error: delError } = await del;
    if (delError) {
      console.error('[supabase] savePlaces delete-stale failed', delError);
    }
  },

  async loadDays(mode) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('trip_meta')
      .select('days')
      .eq('mode', mode)
      .maybeSingle();
    if (error) {
      console.error('[supabase] loadDays failed', error);
      return null;
    }
    return (data as { days: TripDay[] } | null)?.days ?? null;
  },

  async saveDays(mode, days) {
    if (!supabase) return;
    const { error } = await supabase
      .from('trip_meta')
      .upsert(
        { mode, days } as Partial<TripMetaRow>,
        { onConflict: 'mode' },
      );
    if (error) console.error('[supabase] saveDays failed', error);
  },

  async loadSeedVersion(mode) {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('trip_meta')
      .select('seed_version')
      .eq('mode', mode)
      .maybeSingle();
    if (error) {
      console.error('[supabase] loadSeedVersion failed', error);
      return null;
    }
    return (data as { seed_version: string } | null)?.seed_version ?? null;
  },

  async saveSeedVersion(mode, version) {
    if (!supabase) return;
    const { error } = await supabase
      .from('trip_meta')
      .upsert(
        { mode, seed_version: version } as Partial<TripMetaRow>,
        { onConflict: 'mode' },
      );
    if (error) console.error('[supabase] saveSeedVersion failed', error);
  },
};

// The adapter the rest of the app uses. Supabase when configured,
// localStorage otherwise.
export const activeAdapter: StorageAdapter = isSupabaseConfigured
  ? supabaseAdapter
  : localStorageAdapter;

