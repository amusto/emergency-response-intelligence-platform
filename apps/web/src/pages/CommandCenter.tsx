import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type {
  Facility,
  Incident,
  LayerKey,
  MapFocusTarget,
  Resource,
  SelectedEntity,
} from '../types';
import OperationalMap from '../components/OperationalMap';
import LayerFilters from '../components/LayerFilters';
import DetailsPanel from '../components/DetailsPanel';
import SearchPanel from '../components/SearchPanel';

export default function CommandCenter() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [visibleLayers, setVisibleLayers] = useState<Record<LayerKey, boolean>>({
    incidents: true,
    resources: true,
    facilities: true,
  });
  const [selected, setSelected] = useState<SelectedEntity>(null);
  const [focus, setFocus] = useState<MapFocusTarget | null>(null);

  // Select an entity and fly the map to it (used by search + marker clicks).
  const focusEntity = (entity: SelectedEntity) => {
    setSelected(entity);
    if (!entity) return;
    const point =
      entity.kind === 'incident'
        ? { lat: entity.data.location.latitude, lng: entity.data.location.longitude }
        : { lat: entity.data.latitude, lng: entity.data.longitude };
    setFocus({ ...point, nonce: Date.now() });
  };

  useEffect(() => {
    let active = true;
    Promise.all([api.getIncidents(), api.getResources(), api.getFacilities()])
      .then(([inc, res, fac]) => {
        if (!active) return;
        setIncidents(inc);
        setResources(res);
        setFacilities(fac);
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load data');
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo<Record<LayerKey, number>>(
    () => ({
      incidents: incidents.length,
      resources: resources.length,
      facilities: facilities.length,
    }),
    [incidents, resources, facilities],
  );

  const activeP1 = useMemo(
    () => incidents.filter((i) => i.priority === 'P1' && i.status !== 'Resolved').length,
    [incidents],
  );
  const availableUnits = useMemo(
    () => resources.filter((r) => r.status === 'Available').length,
    [resources],
  );

  const toggleLayer = (layer: LayerKey) =>
    setVisibleLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">ERIP</span>
          <span className="brand-sub">Command Center</span>
        </div>
        <div className="stats">
          <div className="stat">
            <span className="stat-value">{activeP1}</span>
            <span className="stat-label">Active P1</span>
          </div>
          <div className="stat">
            <span className="stat-value">{availableUnits}</span>
            <span className="stat-label">Units available</span>
          </div>
          <div className="stat">
            <span className="stat-value">{facilities.length}</span>
            <span className="stat-label">Facilities</span>
          </div>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <SearchPanel onSelectResult={focusEntity} />
          <LayerFilters
            visibleLayers={visibleLayers}
            counts={counts}
            onToggle={toggleLayer}
          />
          <DetailsPanel
            selected={selected}
            onClear={() => setSelected(null)}
            onFocus={focusEntity}
          />
        </aside>

        <main className="map-area">
          {loading && <div className="overlay">Loading operating picture…</div>}
          {error && <div className="overlay overlay-error">{error}</div>}
          {!loading && !error && (
            <OperationalMap
              incidents={incidents}
              resources={resources}
              facilities={facilities}
              visibleLayers={visibleLayers}
              selected={selected}
              focus={focus}
              onSelect={focusEntity}
            />
          )}
        </main>
      </div>
    </div>
  );
}
