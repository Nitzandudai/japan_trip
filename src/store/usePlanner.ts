import { create } from 'zustand';
import type { Filters, Place, TripDay } from '../types';
import { localStorageAdapter, type StorageAdapter } from '../lib/storage';
import { SEED_VERSION, seedDays, seedPlaces } from '../data/seed';

interface PlannerState {
  places: Place[];
  days: TripDay[];
  selectedId: string | null;
  filters: Filters;
  hydrated: boolean;

  // actions
  hydrate: () => Promise<void>;
  setSelected: (id: string | null) => void;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  addPlace: (place: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePlace: (id: string, patch: Partial<Place>) => void;
  removePlace: (id: string) => void;
  assignDay: (id: string, day: Place['dayAssignment']) => void;
  toggleBooked: (id: string) => void;
}

const adapter: StorageAdapter = localStorageAdapter;

const defaultFilters: Filters = {
  category: 'all',
  city: 'all',
  day: 'all',
  reservation: 'all',
  priority: 'all',
  search: '',
};

const persist = async (state: { places: Place[]; days: TripDay[] }) => {
  await adapter.savePlaces(state.places);
  await adapter.saveDays(state.days);
};

const newId = () =>
  `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export const usePlanner = create<PlannerState>((set, get) => ({
  places: [],
  days: [],
  selectedId: null,
  filters: defaultFilters,
  hydrated: false,

  hydrate: async () => {
    const [places, days, storedVersion] = await Promise.all([
      adapter.loadPlaces(),
      adapter.loadDays(),
      adapter.loadSeedVersion(),
    ]);
    const seedOutdated = storedVersion !== SEED_VERSION;
    const resolvedPlaces = seedOutdated || !places ? seedPlaces : places;
    const resolvedDays = seedOutdated || !days ? seedDays : days;
    set({ places: resolvedPlaces, days: resolvedDays, hydrated: true });
    if (seedOutdated || !places || !days) {
      await persist({ places: resolvedPlaces, days: resolvedDays });
      await adapter.saveSeedVersion(SEED_VERSION);
    }
  },

  setSelected: (id) => set({ selectedId: id }),

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  resetFilters: () => set({ filters: defaultFilters }),

  addPlace: (place) => {
    const id = newId();
    const now = new Date().toISOString();
    const full: Place = { ...place, id, createdAt: now, updatedAt: now };
    set((s) => {
      const next = [...s.places, full];
      void adapter.savePlaces(next);
      return { places: next, selectedId: id };
    });
    return id;
  },

  updatePlace: (id, patch) => {
    set((s) => {
      const next = s.places.map((p) =>
        p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
      );
      void adapter.savePlaces(next);
      return { places: next };
    });
  },

  removePlace: (id) => {
    set((s) => {
      const next = s.places.filter((p) => p.id !== id);
      void adapter.savePlaces(next);
      return {
        places: next,
        selectedId: s.selectedId === id ? null : s.selectedId,
      };
    });
  },

  assignDay: (id, day) => get().updatePlace(id, { dayAssignment: day }),

  toggleBooked: (id) => {
    const p = get().places.find((x) => x.id === id);
    if (!p) return;
    get().updatePlace(id, { reservationBooked: !p.reservationBooked });
  },
}));

// Derived selectors
export const selectFiltered = (s: PlannerState): Place[] => {
  const f = s.filters;
  const q = f.search.trim().toLowerCase();
  return s.places.filter((p) => {
    if (f.category !== 'all' && p.category !== f.category) return false;
    if (f.city !== 'all' && p.city !== f.city) return false;
    if (f.day !== 'all' && p.dayAssignment !== f.day) return false;
    if (f.priority !== 'all' && p.priority !== f.priority) return false;
    if (f.reservation !== 'all') {
      if (f.reservation === 'required' && !p.reservationRequired) return false;
      if (f.reservation === 'booked' && !(p.reservationRequired && p.reservationBooked))
        return false;
      if (f.reservation === 'unbooked' && !(p.reservationRequired && !p.reservationBooked))
        return false;
      if (f.reservation === 'none' && p.reservationRequired) return false;
    }
    if (q) {
      const hay = `${p.name} ${p.notes} ${p.city} ${p.address ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
};

export const selectCities = (s: PlannerState): string[] =>
  Array.from(new Set(s.places.map((p) => p.city))).sort();
