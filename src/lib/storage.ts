import type { Place, TripDay } from '../types';

// Storage adapter. Currently backed by localStorage; swap for Supabase later
// by re-implementing this interface against `supabase.from('places')` etc.

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
