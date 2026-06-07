import { useEffect, useState } from 'react';
import { MapView } from './components/MapView';
import { ListView } from './components/ListView';
import { Filters } from './components/Filters';
import { DayTabs } from './components/DayTabs';
import { PlaceDetails } from './components/PlaceDetails';
import { PlaceForm } from './components/PlaceForm';
import { usePlanner } from './store/usePlanner';
import type { Place } from './types';
import './App.css';

type Tab = 'map' | 'list';

export default function App() {
  const hydrate = usePlanner((s) => s.hydrate);
  const hydrated = usePlanner((s) => s.hydrated);
  const selectedId = usePlanner((s) => s.selectedId);
  const [tab, setTab] = useState<Tab>('map');
  const [editing, setEditing] = useState<Place | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!hydrated) return <div className="loading">Loading trip…</div>;

  const showDetails = !!selectedId;
  const modalOpen = creating || editing !== null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">⛩️</span>
          <h1>Japan Trip Planner</h1>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setCreating(true)}>
            + Add place
          </button>
        </div>
      </header>

      <div className="toolbar">
        <Filters />
        <DayTabs />
      </div>

      <div className={'view-tabs ' + tab}>
        <button
          className={'view-tab' + (tab === 'map' ? ' active' : '')}
          onClick={() => setTab('map')}
        >
          Map
        </button>
        <button
          className={'view-tab' + (tab === 'list' ? ' active' : '')}
          onClick={() => setTab('list')}
        >
          List
        </button>
      </div>

      <main className="main">
        <section className={'pane map-pane ' + (tab === 'map' ? 'visible' : 'hidden-mobile')}>
          <MapView />
        </section>
        <section className={'pane list-pane ' + (tab === 'list' ? 'visible' : 'hidden-mobile')}>
          <ListView />
        </section>
        {showDetails && (
          <PlaceDetails
            onEdit={(p) => setEditing(p)}
          />
        )}
      </main>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => { setCreating(false); setEditing(null); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <PlaceForm
              place={editing ?? undefined}
              onClose={() => {
                setCreating(false);
                setEditing(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
