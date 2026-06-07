// Domain types. Designed so each entity can map 1:1 to a Supabase table later.
// Field names match a future `places` table; the storage layer is swappable.

export type Category =
  | 'food'
  | 'shopping'
  | 'culture'
  | 'nature'
  | 'accommodation'
  | 'experience'
  | 'transport'
  | 'other';

export type Priority = 'must-see' | 'optional' | 'spare-time';

export type DayAssignment = number | 'spare' | null;

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Place {
  id: string;
  name: string;
  category: Category;
  city: string;
  coordinates: Coordinates;
  notes: string;
  estimatedDurationMin: number; // minutes
  priority: Priority;
  dayAssignment: DayAssignment; // day number, 'spare', or null (unassigned)
  reservationRequired: boolean;
  reservationBooked: boolean;
  reservationUrl: string | null; // booking confirmation / ticket / reservation page
  address?: string;
  openingHours?: string;
  websiteUrl?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface TripDay {
  day: number;
  date?: string; // ISO date
  label: string;
  city?: string;
}

export interface Filters {
  category: Category | 'all';
  city: string | 'all';
  day: DayAssignment | 'all';
  reservation: 'all' | 'required' | 'booked' | 'unbooked' | 'none';
  priority: Priority | 'all';
  search: string;
}
