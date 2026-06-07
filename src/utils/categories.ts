import type { Category } from '../types';

export const CATEGORIES: { value: Category; label: string; color: string; emoji: string }[] = [
  { value: 'food', label: 'Food', color: '#dc2626', emoji: '🍣' },
  { value: 'shopping', label: 'Shopping', color: '#a855f7', emoji: '🛍️' },
  { value: 'culture', label: 'Culture', color: '#ea580c', emoji: '⛩️' },
  { value: 'nature', label: 'Nature', color: '#16a34a', emoji: '🌳' },
  { value: 'accommodation', label: 'Stay', color: '#0891b2', emoji: '🏨' },
  { value: 'experience', label: 'Experience', color: '#db2777', emoji: '🎎' },
  { value: 'transport', label: 'Transport', color: '#4b5563', emoji: '🚆' },
  { value: 'other', label: 'Other', color: '#64748b', emoji: '📍' },
];

export const CATEGORY_MAP: Record<Category, (typeof CATEGORIES)[number]> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.value] = c;
    return acc;
  },
  {} as Record<Category, (typeof CATEGORIES)[number]>,
);
