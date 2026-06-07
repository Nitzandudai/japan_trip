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

// Try to pull a (lat, lng) pair out of whatever the user pasted.
// Handles:
//   "35.6595, 139.7004"                              ← right-click → copy coords
//   "https://maps.app.goo.gl/...?q=35.6595,139.7004"
//   "https://www.google.com/maps/place/Name/@35.6595,139.7004,17z/..."
//   "https://www.google.com/maps?q=35.6595,139.7004"
function parseCoords(input: string): { lat: number; lng: number } | null {
  const text = input.trim();
  if (!text) return null;

  // Google Maps URLs put coords after an "@" or in a "q=" / "ll=" param.
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /[?&](?:q|ll|destination)=(-?\d+\.\d+),(-?\d+\.\d+)/,
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /^\s*(-?\d+\.\d+)\s*[, ]\s*(-?\d+\.\d+)\s*$/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return null;
}

export function PlaceForm({ place, onClose }: Props) {
  const days = usePlanner((s) => s.days);
  const addPlace = usePlanner((s) => s.addPlace);
  const updatePlace = usePlanner((s) => s.updatePlace);
  const [form, setForm] = useState<FormState>(empty);
  const [pasteText, setPasteText] = useState('');
  const [pasteStatus, setPasteStatus] = useState<'idle' | 'ok' | 'error'>('idle');

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

  const applyPaste = (text: string) => {
    setPasteText(text);
    if (!text.trim()) {
      setPasteStatus('idle');
      return;
    }
    const coords = parseCoords(text);
    if (coords) {
      set('coordinates', coords);
      setPasteStatus('ok');
    } else {
      setPasteStatus('error');
    }
  };

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

        <label className="full">
          <span className="paste-label-row">
            From Google Maps
            <span className={'paste-hint paste-hint-' + pasteStatus}>
              {pasteStatus === 'ok'
                ? '✓ Coordinates filled in below'
                : pasteStatus === 'error'
                ? "Couldn't find coordinates in that text"
                : 'Paste a Google Maps link, or right-click the map → click coords to copy'}
            </span>
          </span>
          <input
            type="text"
            placeholder="https://maps.app.goo.gl/…  or  35.6595, 139.7004"
            value={pasteText}
            onChange={(e) => applyPaste(e.target.value)}
          />
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
