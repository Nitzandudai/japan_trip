import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Place } from '../types';
import { CATEGORY_MAP } from '../utils/categories';
import { selectFiltered, usePlanner } from '../store/usePlanner';

// Build a small DivIcon styled per category + priority.
function makeIcon(place: Place, isSelected: boolean): L.DivIcon {
  const cat = CATEGORY_MAP[place.category];
  const ring =
    place.priority === 'must-see'
      ? '#facc15'
      : place.priority === 'optional'
      ? '#ffffff'
      : '#94a3b8';
  const size = isSelected ? 38 : 30;
  const html = `
    <div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${cat.color};
      box-shadow:0 0 0 3px ${ring}, 0 2px 6px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:${size * 0.55}px;line-height:1;
      transform:translate(-50%,-50%);">
      <span>${cat.emoji}</span>
    </div>`;
  return L.divIcon({
    html,
    className: 'planner-marker',
    iconSize: [size, size],
    iconAnchor: [0, 0],
  });
}

function FlyToSelected() {
  const map = useMap();
  const selectedId = usePlanner((s) => s.selectedId);
  const places = usePlanner((s) => s.places);
  useEffect(() => {
    if (!selectedId) return;
    const p = places.find((x) => x.id === selectedId);
    if (!p) return;
    map.flyTo([p.coordinates.lat, p.coordinates.lng], Math.max(map.getZoom(), 13), {
      duration: 0.6,
    });
  }, [selectedId, places, map]);
  return null;
}

export function MapView() {
  const filtered = usePlanner(selectFiltered);
  const selectedId = usePlanner((s) => s.selectedId);
  const setSelected = usePlanner((s) => s.setSelected);
  const markerRefs = useRef<Record<string, L.Marker | null>>({});

  // Open popup of the selected marker
  useEffect(() => {
    if (!selectedId) return;
    const m = markerRefs.current[selectedId];
    if (m) m.openPopup();
  }, [selectedId]);

  // Center on Japan; rough bounds give nice initial framing.
  const center = useMemo<[number, number]>(() => [36.2, 138.25], []);

  return (
    <MapContainer
      center={center}
      zoom={6}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyToSelected />
      {filtered.map((p) => (
        <Marker
          key={p.id}
          position={[p.coordinates.lat, p.coordinates.lng]}
          icon={makeIcon(p, p.id === selectedId)}
          ref={(ref) => {
            markerRefs.current[p.id] = ref;
          }}
          eventHandlers={{
            click: () => setSelected(p.id),
          }}
        >
          <Popup>
            <strong>{p.name}</strong>
            <br />
            <small>
              {CATEGORY_MAP[p.category].label} · {p.city}
            </small>
            {p.notes && (
              <>
                <br />
                <span style={{ fontSize: 12 }}>{p.notes}</span>
              </>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
