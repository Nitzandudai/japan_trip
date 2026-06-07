import { usePlanner } from '../store/usePlanner';
import { CATEGORY_MAP } from '../utils/categories';
import type { Place } from '../types';

interface Props {
  onEdit: (place: Place) => void;
}

export function PlaceDetails({ onEdit }: Props) {
  const selectedId = usePlanner((s) => s.selectedId);
  const place = usePlanner((s) => s.places.find((p) => p.id === selectedId) ?? null);
  const days = usePlanner((s) => s.days);
  const setSelected = usePlanner((s) => s.setSelected);
  const assignDay = usePlanner((s) => s.assignDay);
  const toggleBooked = usePlanner((s) => s.toggleBooked);
  const removePlace = usePlanner((s) => s.removePlace);

  if (!place) return null;
  const cat = CATEGORY_MAP[place.category];
  const { lat, lng } = place.coordinates;
  const gmapsViewUrl = `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`;

  return (
    <aside className="details-panel">
      <header className="details-header">
        <div className="details-title">
          <span className="cat-dot lg" style={{ background: cat.color }}>
            {cat.emoji}
          </span>
          <div>
            <h2>{place.name}</h2>
            <div className="muted">
              {cat.label} · {place.city}
            </div>
          </div>
        </div>
        <button className="btn-ghost" onClick={() => setSelected(null)}>
          ✕
        </button>
      </header>

      {place.notes && <p className="details-notes">{place.notes}</p>}

      <dl className="details-grid">
        <dt>Priority</dt>
        <dd>{place.priority}</dd>
        <dt>Duration</dt>
        <dd>{place.estimatedDurationMin} min</dd>
        {place.address && (
          <>
            <dt>Address</dt>
            <dd>{place.address}</dd>
          </>
        )}
        <dt>Coords</dt>
        <dd>
          {place.coordinates.lat.toFixed(4)}, {place.coordinates.lng.toFixed(4)}
        </dd>
      </dl>

      <div className="details-section">
        <label className="details-label">Assign day</label>
        <select
          value={
            place.dayAssignment === null
              ? 'null'
              : place.dayAssignment === 'spare'
              ? 'spare'
              : String(place.dayAssignment)
          }
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'null') assignDay(place.id, null);
            else if (v === 'spare') assignDay(place.id, 'spare');
            else assignDay(place.id, Number(v));
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
      </div>

      <div className="details-section reservation-box">
        <div className="row-between">
          <strong>Reservation</strong>
          {place.reservationRequired ? (
            <span className={place.reservationBooked ? 'pill ok' : 'pill warn'}>
              {place.reservationBooked ? '✓ Booked' : '⚠ Not booked'}
            </span>
          ) : (
            <span className="muted">Not required</span>
          )}
        </div>
        {place.reservationRequired && (
          <>
            <button
              className="btn-ghost wide"
              onClick={() => toggleBooked(place.id)}
            >
              Mark as {place.reservationBooked ? 'not booked' : 'booked'}
            </button>
            {place.reservationUrl && (
              <a
                className="btn-link wide"
                href={place.reservationUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open booking / ticket ↗
              </a>
            )}
          </>
        )}
      </div>

      <div className="details-section">
        <a
          className="btn-link wide"
          href={gmapsViewUrl}
          target="_blank"
          rel="noreferrer"
        >
          📍 Open in Google Maps
        </a>
      </div>

      <div className="details-actions">
        <button className="btn-primary" onClick={() => onEdit(place)}>
          Edit
        </button>
        <button
          className="btn-danger"
          onClick={() => {
            if (confirm(`Delete "${place.name}"?`)) removePlace(place.id);
          }}
        >
          Delete
        </button>
      </div>
    </aside>
  );
}
