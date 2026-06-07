import type { Category, Priority } from '../types';
import { CATEGORIES } from '../utils/categories';
import { selectCities, usePlanner } from '../store/usePlanner';

export function Filters() {
  const filters = usePlanner((s) => s.filters);
  const setFilter = usePlanner((s) => s.setFilter);
  const reset = usePlanner((s) => s.resetFilters);
  const days = usePlanner((s) => s.days);
  const cities = usePlanner(selectCities);

  return (
    <div className="filters">
      <input
        className="filter-input"
        placeholder="Search…"
        value={filters.search}
        onChange={(e) => setFilter('search', e.target.value)}
      />
      <select
        value={filters.category}
        onChange={(e) => setFilter('category', e.target.value as Category | 'all')}
      >
        <option value="all">All categories</option>
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.emoji} {c.label}
          </option>
        ))}
      </select>

      <select value={filters.city} onChange={(e) => setFilter('city', e.target.value)}>
        <option value="all">All cities</option>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={String(filters.day)}
        onChange={(e) => {
          const v = e.target.value;
          if (v === 'all') setFilter('day', 'all');
          else if (v === 'spare') setFilter('day', 'spare');
          else if (v === 'null') setFilter('day', null);
          else setFilter('day', Number(v));
        }}
      >
        <option value="all">All days</option>
        {days.map((d) => (
          <option key={d.day} value={d.day}>
            Day {d.day} — {d.label}
          </option>
        ))}
        <option value="spare">Spare time</option>
        <option value="null">Unassigned</option>
      </select>

      <select
        value={filters.priority}
        onChange={(e) => setFilter('priority', e.target.value as Priority | 'all')}
      >
        <option value="all">All priorities</option>
        <option value="must-see">Must-see</option>
        <option value="optional">Optional</option>
        <option value="spare-time">Spare-time</option>
      </select>

      <select
        value={filters.reservation}
        onChange={(e) =>
          setFilter(
            'reservation',
            e.target.value as 'all' | 'required' | 'booked' | 'unbooked' | 'none',
          )
        }
      >
        <option value="all">All reservations</option>
        <option value="required">Required (any)</option>
        <option value="unbooked">Required — not booked</option>
        <option value="booked">Required — booked</option>
        <option value="none">No reservation</option>
      </select>

      <button className="btn-ghost" onClick={reset}>
        Reset
      </button>
    </div>
  );
}
