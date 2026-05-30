import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type {
  Facility,
  Incident,
  LayerKey,
  MapFocusTarget,
  Resource,
  RouteResult,
  SelectedEntity,
} from '../types';
import OperationalMap from '../components/OperationalMap';
import LayerFilters from '../components/LayerFilters';
import DetailsPanel from '../components/DetailsPanel';
import SearchPanel from '../components/SearchPanel';

function fmtDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function fmtKm(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
}

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
  const [route, setRoute] = useState<RouteResult | null>(null);
  // Mobile-only drawer state; ignored by the static desktop layout via CSS.
  const [panelOpen, setPanelOpen] = useState(false);

  const selectedIncidentId = selected?.kind === 'incident' ? selected.data.id : null;

  // From search: select + reveal the map (close the drawer on mobile).
  const selectFromSearch = (entity: SelectedEntity) => {
    focusEntity(entity);
    setPanelOpen(false);
  };

  // Select an entity and fly the map to it (used by search + marker clicks).
  const focusEntity = (entity: SelectedEntity) => {
    // Switching to a different incident invalidates any drawn route.
    if (entity?.kind === 'incident' && entity.data.id !== selectedIncidentId) {
      setRoute(null);
    }
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
          <button
            className="panel-toggle"
            aria-label="Toggle panel"
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((o) => !o)}
          >
            ☰
          </button>
          <span className="brand-mark">ERIP</span>
          <span className="brand-sub">Command Center</span>
        </div>
        <div className="topbar-right">
          <Link className="nav-link" to="/responder">
            Responder →
          </Link>
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
        </div>
      </header>

      <div className="layout">
        {panelOpen && (
          <div className="backdrop" onClick={() => setPanelOpen(false)} />
        )}
        <aside className={`sidebar${panelOpen ? ' sidebar--open' : ''}`}>
          <SearchPanel onSelectResult={selectFromSearch} />
          <LayerFilters
            visibleLayers={visibleLayers}
            counts={counts}
            onToggle={toggleLayer}
          />
          <DetailsPanel
            selected={selected}
            onClear={() => setSelected(null)}
            onFocus={focusEntity}
            onRoute={setRoute}
          />
        </aside>

        <main className="map-area">
          {loading && <div className="overlay">Loading operating picture…</div>}
          {error && <div className="overlay overlay-error">{error}</div>}
          {route && (
            <div className="route-banner">
              <span
                className={`route-engine route-engine--${route.engine}`}
                title={
                  route.engine === 'valhalla'
                    ? 'Valhalla road-network route'
                    : 'Straight-line estimate (Valhalla unavailable)'
                }
              >
                {route.engine === 'valhalla' ? 'Valhalla' : 'Estimated'}
              </span>
              <span className="route-stat">{fmtDuration(route.durationSeconds)}</span>
              <span className="route-stat">{fmtKm(route.distanceMeters)}</span>
              <button className="clear-btn" onClick={() => setRoute(null)}>
                Clear route
              </button>
            </div>
          )}
          {!loading && !error && (
            <OperationalMap
              incidents={incidents}
              resources={resources}
              facilities={facilities}
              visibleLayers={visibleLayers}
              selected={selected}
              focus={focus}
              route={route}
              onSelect={focusEntity}
            />
          )}
        </main>
      </div>
    </div>
  );
}
