import type { Place, TripDay } from '../types';

// ----------------------------------------------------------------------------
// Dev toggle: 'real' for your actual trip data, 'demo' to show off example
// places. Each mode has its own independent storage — switching is safe.
// ----------------------------------------------------------------------------
export const MODE: 'real' | 'demo' = 'real';

// Bump this when you edit `seedPlaces` or `seedDays` and want the change to
// overwrite the browser's saved data on next load. Affects the current MODE
// only — the other mode's data is untouched.
export const SEED_VERSION = '2026-10-itinerary-v1';

const now = new Date().toISOString();

const make = (p: Omit<Place, 'createdAt' | 'updatedAt'>): Place => ({
  ...p,
  createdAt: now,
  updatedAt: now,
});

// Flights: depart origin 27/10/2026 19:00 (land Tokyo 28/10 morning).
// Return flight from Tokyo 12/11/2026 15:45 — last day is airport only.
export const seedDays: TripDay[] = [
  { day: 1,  date: '2026-10-28', label: 'Arrival — Tokyo',            city: 'Tokyo'  },
  { day: 2,  date: '2026-10-29', label: 'Tokyo: Asakusa & Akihabara', city: 'Tokyo'  },
  { day: 3,  date: '2026-10-30', label: 'Tokyo: Shibuya & Harajuku',  city: 'Tokyo'  },
  { day: 4,  date: '2026-10-31', label: 'Tokyo: teamLab & Odaiba',    city: 'Tokyo'  },
  { day: 5,  date: '2026-11-01', label: 'Day trip: Hakone',           city: 'Hakone' },
  { day: 6,  date: '2026-11-02', label: 'Tokyo: Ghibli / buffer day', city: 'Tokyo'  },
  { day: 7,  date: '2026-11-03', label: 'Shinkansen to Kyoto',        city: 'Kyoto'  },
  { day: 8,  date: '2026-11-04', label: 'Kyoto: Fushimi Inari & Gion',city: 'Kyoto'  },
  { day: 9,  date: '2026-11-05', label: 'Kyoto: Arashiyama',          city: 'Kyoto'  },
  { day: 10, date: '2026-11-06', label: 'Nara day trip',              city: 'Nara'   },
  { day: 11, date: '2026-11-07', label: 'Osaka day',                  city: 'Osaka'  },
  { day: 12, date: '2026-11-08', label: 'Osaka / Himeji',             city: 'Osaka'  },
  { day: 13, date: '2026-11-09', label: 'Shinkansen back to Tokyo',   city: 'Tokyo'  },
  { day: 14, date: '2026-11-10', label: 'Tokyo: free / shopping',     city: 'Tokyo'  },
  { day: 15, date: '2026-11-11', label: 'Tokyo: last full day',       city: 'Tokyo'  },
  { day: 16, date: '2026-11-12', label: 'Departure — flight 15:45',   city: 'Tokyo'  },
];

export const seedPlaces: Place[] = [
  make({
    id: 'p_senso_ji',
    name: 'Sensō-ji Temple',
    category: 'culture',
    city: 'Tokyo',
    coordinates: { lat: 35.7148, lng: 139.7967 },
    notes: 'Go early to avoid crowds. Walk Nakamise-dori on the way in.',
    estimatedDurationMin: 90,
    priority: 'must-see',
    dayAssignment: 2,
    reservationRequired: false,
    reservationBooked: false,
    reservationUrl: null,
    address: '2 Chome-3-1 Asakusa, Taito City, Tokyo',
  }),
  make({
    id: 'p_teamlab',
    name: 'teamLab Planets',
    category: 'experience',
    city: 'Tokyo',
    coordinates: { lat: 35.6488, lng: 139.7906 },
    notes: 'Wear shorts or roll-up pants — water exhibits.',
    estimatedDurationMin: 120,
    priority: 'must-see',
    dayAssignment: 4,
    reservationRequired: true,
    reservationBooked: false,
    reservationUrl: 'https://planets.teamlab.art/tokyo/',
  }),
  make({
    id: 'p_sushidai',
    name: 'Sushi Dai (Toyosu)',
    category: 'food',
    city: 'Tokyo',
    coordinates: { lat: 35.6459, lng: 139.7853 },
    notes: 'Line up before 5am. Cash only.',
    estimatedDurationMin: 60,
    priority: 'optional',
    dayAssignment: 'spare',
    reservationRequired: false,
    reservationBooked: false,
    reservationUrl: null,
  }),
  make({
    id: 'p_shibuya_crossing',
    name: 'Shibuya Crossing',
    category: 'culture',
    city: 'Tokyo',
    coordinates: { lat: 35.6595, lng: 139.7004 },
    notes: 'Best view from Shibuya Sky or Starbucks Tsutaya.',
    estimatedDurationMin: 45,
    priority: 'must-see',
    dayAssignment: 3,
    reservationRequired: false,
    reservationBooked: false,
    reservationUrl: null,
  }),
  make({
    id: 'p_fushimi_inari',
    name: 'Fushimi Inari Shrine',
    category: 'culture',
    city: 'Kyoto',
    coordinates: { lat: 34.9671, lng: 135.7727 },
    notes: 'Hike to the top takes ~2h round trip. Go at sunrise.',
    estimatedDurationMin: 150,
    priority: 'must-see',
    dayAssignment: 8,
    reservationRequired: false,
    reservationBooked: false,
    reservationUrl: null,
  }),
  make({
    id: 'p_arashiyama_bamboo',
    name: 'Arashiyama Bamboo Grove',
    category: 'nature',
    city: 'Kyoto',
    coordinates: { lat: 35.0170, lng: 135.6716 },
    notes: 'Combine with Tenryū-ji temple next door.',
    estimatedDurationMin: 60,
    priority: 'must-see',
    dayAssignment: 9,
    reservationRequired: false,
    reservationBooked: false,
    reservationUrl: null,
  }),
  make({
    id: 'p_dotonbori',
    name: 'Dōtonbori Street Food',
    category: 'food',
    city: 'Osaka',
    coordinates: { lat: 34.6687, lng: 135.5031 },
    notes: 'Takoyaki, okonomiyaki, kushikatsu. Evening only.',
    estimatedDurationMin: 120,
    priority: 'must-see',
    dayAssignment: 11,
    reservationRequired: false,
    reservationBooked: false,
    reservationUrl: null,
  }),
  make({
    id: 'p_nara_park',
    name: 'Nara Park (deer)',
    category: 'nature',
    city: 'Nara',
    coordinates: { lat: 34.6851, lng: 135.8430 },
    notes: 'Buy shika senbei to feed the deer.',
    estimatedDurationMin: 120,
    priority: 'must-see',
    dayAssignment: 10,
    reservationRequired: false,
    reservationBooked: false,
    reservationUrl: null,
  }),
  make({
    id: 'p_ghibli_museum',
    name: 'Ghibli Museum',
    category: 'culture',
    city: 'Tokyo',
    coordinates: { lat: 35.6962, lng: 139.5704 },
    notes: 'Tickets sell out 1 month in advance — lottery.',
    estimatedDurationMin: 180,
    priority: 'optional',
    dayAssignment: 6,
    reservationRequired: true,
    reservationBooked: false,
    reservationUrl: 'https://l-tike.com/ghibli/',
  }),
  make({
    id: 'p_hakone_onsen',
    name: 'Hakone Yuryo Onsen',
    category: 'experience',
    city: 'Hakone',
    coordinates: { lat: 35.2367, lng: 139.1058 },
    notes: 'Private bath option available, book ahead.',
    estimatedDurationMin: 120,
    priority: 'must-see',
    dayAssignment: 5,
    reservationRequired: true,
    reservationBooked: true,
    reservationUrl: 'https://www.hakoneyuryo.jp/en/',
  }),
];

// What the app actually loads on a fresh start / seed-version bump.
// Days come from seed.ts in both modes; places are empty in 'real' mode.
export const activeSeedPlaces: Place[] = (MODE as string) === 'demo' ? seedPlaces : [];
export const activeSeedDays: TripDay[] = seedDays;
