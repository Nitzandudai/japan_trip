import { useEffect, useState } from 'react';
import type { Category, Place, Priority } from '../types';
import { CATEGORIES } from '../utils/categories';
import { usePlanner } from '../store/usePlanner';

interface Props {
  place?: Place; // when present we edit; otherwise create
  onClose: () => void;
}

type FormState = Omit<Place, 'id' | 'createdAt' | 'updatedAt'>;

const empty: FormState = {
  name: '',
  category: 'culture',
  city: '',
  coordinates: { lat: 35.6762, lng: 139.6503 },
  notes: '',
  estimatedDurationMin: 60,
  priority: 'optional',
  dayAssignment: null,
  reservationRequired: false,
  reservationBooked: false,
  reservationUrl: null,
};

export function PlaceForm({ place, onClose }: Props) {
  const days = usePlanner((s) => s.days);
  const addPlace = usePlanner((s) => s.addPlace);
  const updatePlace = usePlanner((s) => s.updatePlace);
  const [form, setForm] = useState<FormState>(empty);

  useEffect(() => {
    if (place) {
      const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = place;
      void _id;
      void _c;
      void _u;
      setForm(rest);
    } else {
      setForm(empty);
    }
  }, [place]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim()) return;
    if (place) updatePlace(place.id, form);
    else addPlace(form);
    onClose();
  };

  return (
    <form className="modal-form" onSubmit={submit}>
      <header className="modal-header">
        <h3>{place ? 'Edit place' : 'New place'}</h3>
        <button type="button" className="btn-ghost" onClick={onClose}>
          ✕
        </button>
      </header>

      <div className="form-grid">
        <label>
          Name
          <input
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </label>

        <label>
          City
          <input
            required
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
          />
        </label>

        <label>
          Category
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Priority
          <select
            value={form.priority}
            onChange={(e) => set('priority', e.target.value as Priority)}
          >
            <option value="must-see">Must-see</option>
            <option value="optional">Optional</option>
            <option value="spare-time">Spare-time</option>
          </select>
        </label>

        <label>
          Latitude
          <input
            type="number"
            step="0.0001"
            value={form.coordinates.lat}
            onChange={(e) =>
              set('coordinates', { ...form.coordinates, lat: Number(e.target.value) })
            }
          />
        </label>

        <label>
          Longitude
          <input
            type="number"
            step="0.0001"
            value={form.coordinates.lng}
            onChange={(e) =>
              set('coordinates', { ...form.coordinates, lng: Number(e.target.value) })
            }
          />
        </label>

        <label>
          Duration (min)
          <input
            type="number"
            min={0}
            step={15}
            value={form.estimatedDurationMin}
            onChange={(e) => set('estimatedDurationMin', Number(e.target.value))}
          />
        </label>

        <label>
          Day
          <select
            value={
              form.dayAssignment === null
                ? 'null'
                : form.dayAssignment === 'spare'
                ? 'spare'
                : String(form.dayAssignment)
            }
            onChange={(e) => {
              const v = e.target.value;
              if (v === 'null') set('dayAssignment', null);
              else if (v === 'spare') set('dayAssignment', 'spare');
              else set('dayAssignment', Number(v));
            }}
          >
            <option value="null">Unassigned</option>
            <option value="spare">Spare time</option>
            {days.map((d) => (
              <option key={d.day} value={d.day}>
                Day {d.day} — {d.label}
              </option>
            ))}
          </select>
        </label>

        <label className="full">
          Notes
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
          />
        </label>

        <label className="full">
          Address
          <input
            value={form.address ?? ''}
            onChange={(e) => set('address', e.target.value)}
          />
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={form.reservationRequired}
            onChange={(e) => set('reservationRequired', e.target.checked)}
          />
          Reservation required
        </label>

        <label className="checkbox">
          <input
            type="checkbox"
            disabled={!form.reservationRequired}
            checked={form.reservationBooked}
            onChange={(e) => set('reservationBooked', e.target.checked)}
          />
          Booked
        </label>

        <label className="full">
          Reservation / ticket URL
          <input
            type="url"
            placeholder="https://…"
            value={form.reservationUrl ?? ''}
            onChange={(e) => set('reservationUrl', e.target.value || null)}
          />
        </label>
      </div>

      <footer className="modal-footer">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {place ? 'Save' : 'Add place'}
        </button>
      </footer>
    </form>
  );
}
