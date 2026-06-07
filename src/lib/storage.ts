import type { Place, TripDay } from '../types';

// Storage adapter. Currently backed by localStorage; swap for Supabase later
// by re-implementing this interface against `supabase.from('places')` etc.

export interface StorageAdapter {
  loadPlaces(): Promise<Place[] | null>;
  savePlaces(places: Place[]): Promise<void>;
  loadDays(): Promise<TripDay[] | null>;
  saveDays(days: TripDay[]): Promise<void>;
  loadSeedVersion(): Promise<string | null>;
  saveSeedVersion(version: string): Promise<void>;
}

const PLACES_KEY = 'japan-planner.places.v1';
const DAYS_KEY = 'japan-planner.days.v1';
const SEED_VERSION_KEY = 'japan-planner.seedVersion.v1';

export const localStorageAdapter: StorageAdapter = {
  async loadPlaces() {
    try {
      const raw = localStorage.getItem(PLACES_KEY);
      return raw ? (JSON.parse(raw) as Place[]) : null;
    } catch {
      return null;
    }
  },
  async savePlaces(places) {
    localStorage.setItem(PLACES_KEY, JSON.stringify(places));
  },
  async loadDays() {
    try {
      const raw = localStorage.getItem(DAYS_KEY);
      return raw ? (JSON.parse(raw) as TripDay[]) : null;
    } catch {
      return null;
    }
  },
  async saveDays(days) {
    localStorage.setItem(DAYS_KEY, JSON.stringify(days));
  },
  async loadSeedVersion() {
    try {
      return localStorage.getItem(SEED_VERSION_KEY);
    } catch {
      return null;
    }
  },
  async saveSeedVersion(version) {
    localStorage.setItem(SEED_VERSION_KEY, version);
  },
};

// Sketch of a future Supabase adapter — uncomment after `npm i @supabase/supabase-js`
// and create a `places` table matching the Place type.
//
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
// export const supabaseAdapter: StorageAdapter = {
//   async loadPlaces() {
//     const { data } = await supabase.from('places').select('*');
//     return data as Place[] | null;
//   },
//   async savePlaces(places) {
//     await supabase.from('places').upsert(places);
//   },
//   async loadDays() {
//     const { data } = await supabase.from('trip_days').select('*');
//     return data as TripDay[] | null;
//   },
//   async saveDays(days) {
//     await supabase.from('trip_days').upsert(days);
//   },
// };
