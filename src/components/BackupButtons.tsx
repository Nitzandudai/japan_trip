import { useRef } from 'react';
import { usePlanner } from '../store/usePlanner';
import type { Place } from '../types';

const isPlaceArray = (v: unknown): v is Place[] =>
  Array.isArray(v) &&
  v.every(
    (p) =>
      p &&
      typeof p === 'object' &&
      typeof (p as Place).id === 'string' &&
      typeof (p as Place).name === 'string' &&
      (p as Place).coordinates &&
      typeof (p as Place).coordinates.lat === 'number' &&
      typeof (p as Place).coordinates.lng === 'number',
  );

export function BackupButtons() {
  const places = usePlanner((s) => s.places);
  const importPlaces = usePlanner((s) => s.importPlaces);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportNow = () => {
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    const blob = new Blob([JSON.stringify(places, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `japan-trip-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-importing the same file later
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const incoming = Array.isArray(parsed) ? parsed : parsed?.places;
      if (!isPlaceArray(incoming)) {
        alert('That file does not look like a Japan Trip Planner export.');
        return;
      }
      const replace = confirm(
        `Found ${incoming.length} places in the file.\n\n` +
          'OK = REPLACE everything currently in the app with the file contents.\n' +
          'Cancel = MERGE — keep existing places, add/overwrite by id from the file.',
      );
      importPlaces(incoming, replace);
      alert(`Imported ${incoming.length} places.`);
    } catch (err) {
      alert('Could not read that file: ' + (err as Error).message);
    }
  };

  return (
    <div className="backup-buttons">
      <button
        type="button"
        className="btn-ghost btn-on-dark"
        onClick={exportNow}
        title="Download all places as a JSON backup file"
      >
        ⬇ Export
      </button>
      <button
        type="button"
        className="btn-ghost btn-on-dark"
        onClick={() => fileInputRef.current?.click()}
        title="Load a JSON backup file"
      >
        ⬆ Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        title="Import places JSON"
        aria-label="Import places JSON"
        onChange={onFile}
        className="hidden-file-input"
      />
    </div>
  );
}
