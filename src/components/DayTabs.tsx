import { usePlanner } from '../store/usePlanner';
import type { DayAssignment } from '../types';

const dateFmt = new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short' });
const formatDate = (iso?: string) => {
  if (!iso) return undefined;
  const [y, m, d] = iso.split('-').map(Number);
  return dateFmt.format(new Date(y, m - 1, d));
};

export function DayTabs() {
  const days = usePlanner((s) => s.days);
  const places = usePlanner((s) => s.places);
  const filterDay = usePlanner((s) => s.filters.day);
  const setFilter = usePlanner((s) => s.setFilter);

  const countFor = (d: DayAssignment | 'all') =>
    d === 'all' ? places.length : places.filter((p) => p.dayAssignment === d).length;

  const Item = ({
    label,
    sub,
    value,
  }: {
    label: string;
    sub?: string;
    value: DayAssignment | 'all';
  }) => (
    <button
      className={'day-tab' + (filterDay === value ? ' active' : '')}
      onClick={() => setFilter('day', value)}
    >
      <span>{label}</span>
      {sub && <span className="date">{sub}</span>}
      <span className="count">{countFor(value)}</span>
    </button>
  );

  return (
    <div className="day-tabs">
      <Item label="All" value="all" />
      {days.map((d) => (
        <Item key={d.day} label={`Day ${d.day}`} sub={formatDate(d.date)} value={d.day} />
      ))}
      <Item label="Spare" value="spare" />
      <Item label="Unassigned" value={null} />
    </div>
  );
}
