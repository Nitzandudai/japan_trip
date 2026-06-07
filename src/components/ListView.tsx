import { useEffect, useRef } from 'react';
import type { Place } from '../types';
import { CATEGORY_MAP } from '../utils/categories';
import { selectFiltered, usePlanner } from '../store/usePlanner';

function dayLabel(p: Place): string {
  if (p.dayAssignment === 'spare') return 'Spare';
  if (p.dayAssignment === null) return '—';
  return `Day ${p.dayAssignment}`;
}

function priorityBadge(p: Place) {
  const style: React.CSSProperties = {
    fontSize: 11,
    padding: '2px 6px',
    borderRadius: 999,
    fontWeight: 600,
  };
  switch (p.priority) {
    case 'must-see':
      return <span style={{ ...style, background: '#facc15', color: '#78350f' }}>Must</span>;
    case 'optional':
      return <span style={{ ...style, background: '#e2e8f0', color: '#334155' }}>Optional</span>;
    case 'spare-time':
      return <span style={{ ...style, background: '#cffafe', color: '#155e75' }}>Spare</span>;
  }
}

function reservationBadge(p: Place) {
  if (!p.reservationRequired) return <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>;
  return p.reservationBooked ? (
    <span style={{ color: '#15803d', fontSize: 12, fontWeight: 600 }}>✓ Booked</span>
  ) : (
    <span style={{ color: '#b91c1c', fontSize: 12, fontWeight: 600 }}>⚠ Book</span>
  );
}

export function ListView() {
  const filtered = usePlanner(selectFiltered);
  const selectedId = usePlanner((s) => s.selectedId);
  const setSelected = usePlanner((s) => s.setSelected);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    if (!selectedId) return;
    const el = rowRefs.current[selectedId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedId]);

  if (filtered.length === 0) {
    return (
      <div style={{ padding: 24, color: '#64748b' }}>
        No places match the current filters.
      </div>
    );
  }

  return (
    <div className="list-wrap">
      <table className="list-table">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>City</th>
            <th>Day</th>
            <th>Priority</th>
            <th>Duration</th>
            <th>Reservation</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => {
            const cat = CATEGORY_MAP[p.category];
            const isSel = p.id === selectedId;
            return (
              <tr
                key={p.id}
                ref={(el) => {
                  rowRefs.current[p.id] = el;
                }}
                className={isSel ? 'row selected' : 'row'}
                onClick={() => setSelected(p.id)}
              >
                <td>
                  <span
                    className="cat-dot"
                    title={cat.label}
                    style={{ background: cat.color }}
                  >
                    {cat.emoji}
                  </span>
                </td>
                <td>
                  <div className="cell-name">{p.name}</div>
                  {p.notes && <div className="cell-notes">{p.notes}</div>}
                </td>
                <td>{p.city}</td>
                <td>{dayLabel(p)}</td>
                <td>{priorityBadge(p)}</td>
                <td>{p.estimatedDurationMin} min</td>
                <td>{reservationBadge(p)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
