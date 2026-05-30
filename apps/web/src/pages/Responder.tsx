import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
  useMap,
} from 'react-leaflet';
import { api } from '../api/client';
import type { Incident, Resource, RouteResult } from '../types';
import { incidentColor, resourceColor } from '../lib/style';

type LatLng = { lat: number; lng: number };

const SF_CENTER: [number, number] = [37.7749, -122.4294];

function fmtDuration(seconds: number): string {
  const m = Math.max(1, Math.round(seconds / 60));
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}
function fmtKm(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
}

/** Fit the map to the supplied points whenever they change. */
function FitTo({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [60, 60] });
    }
  }, [points, map]);
  return null;
}

export default function Responder() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [unitId, setUnitId] = useState<string>('');
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [device, setDevice] = useState<LatLng | null>(null);
  const [useGps, setUseGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api.getResources(), api.getIncidents()])
      .then(([res, inc]) => {
        if (!active) return;
        setResources(res);
        setIncidents(inc);
        // Default to a unit that actually has an assignment, for a live demo.
        const assigned = res.find((r) => r.assignedIncidentId);
        setUnitId(assigned?.id ?? res[0]?.id ?? '');
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const unit = useMemo(
    () => resources.find((r) => r.id === unitId) ?? null,
    [resources, unitId],
  );
  const assignment = useMemo(
    () =>
      unit?.assignedIncidentId
        ? incidents.find((i) => i.id === unit.assignedIncidentId) ?? null
        : null,
    [unit, incidents],
  );

  const origin: LatLng | null =
    useGps && device
      ? device
      : unit
        ? { lat: unit.latitude, lng: unit.longitude }
        : null;

  useEffect(() => {
    if (!origin || !assignment) {
      setRoute(null);
      return;
    }
    let active = true;
    setRouteLoading(true);
    api
      .route(origin, {
        lat: assignment.location.latitude,
        lng: assignment.location.longitude,
      })
      .then((r) => active && setRoute(r))
      .catch(() => active && setRoute(null))
      .finally(() => active && setRouteLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin?.lat, origin?.lng, assignment?.id]);

  const requestGps = () => {
    if (!('geolocation' in navigator)) {
      setGpsError('Geolocation not available on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDevice({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setUseGps(true);
        setGpsError(null);
      },
      () => setGpsError('Location permission denied.'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  // Stable across renders so the map only re-fits when coordinates change
  // (otherwise every state update would reset the responder's pan/zoom).
  const fitPoints = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [];
    if (origin) pts.push([origin.lat, origin.lng]);
    if (assignment) {
      pts.push([assignment.location.latitude, assignment.location.longitude]);
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin?.lat, origin?.lng, assignment?.id]);

  return (
    <div className="responder-shell">
      <header className="responder-topbar">
        <Link className="nav-link" to="/command">
          ← Command
        </Link>
        <select
          className="unit-select"
          value={unitId}
          onChange={(e) => {
            setUnitId(e.target.value);
            setUseGps(false);
          }}
        >
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.unitNumber} · {r.type} · {r.status}
            </option>
          ))}
        </select>
        <button className="gps-btn" onClick={requestGps} title="Use my GPS location">
          ◎ GPS
        </button>
      </header>

      <div className="responder-map">
        <MapContainer center={SF_CENTER} zoom={13} className="map" zoomControl>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FitTo points={fitPoints} />

          {route && (
            <Polyline
              positions={route.geometry}
              pathOptions={{
                color: route.engine === 'valhalla' ? '#38bdf8' : '#94a3b8',
                weight: 5,
                opacity: 0.9,
                dashArray: route.engine === 'valhalla' ? undefined : '6 8',
              }}
            />
          )}

          {origin && (
            <CircleMarker
              center={[origin.lat, origin.lng]}
              radius={8}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: unit ? resourceColor(unit) : '#22c55e',
                fillOpacity: 1,
              }}
            >
              <Tooltip>{useGps ? 'My location' : unit?.unitNumber}</Tooltip>
            </CircleMarker>
          )}

          {assignment && (
            <CircleMarker
              center={[
                assignment.location.latitude,
                assignment.location.longitude,
              ]}
              radius={11}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: incidentColor(assignment),
                fillOpacity: 0.9,
              }}
            >
              <Tooltip>
                {assignment.priority} {assignment.type}
              </Tooltip>
            </CircleMarker>
          )}
        </MapContainer>
      </div>

      <section className="assignment-sheet">
        {loading && <p className="empty-hint">Loading assignment…</p>}

        {!loading && !assignment && (
          <div>
            <h2 className="sheet-title">No active assignment</h2>
            <p className="empty-hint">
              {unit ? `${unit.unitNumber} is not currently assigned.` : 'Select a unit.'}
            </p>
          </div>
        )}

        {!loading && assignment && (
          <div>
            <div className="sheet-header">
              <span
                className="priority-pill"
                style={{ background: incidentColor(assignment) }}
              >
                {assignment.priority}
              </span>
              <h2 className="sheet-title">{assignment.type}</h2>
            </div>
            <p className="sheet-address">
              {assignment.location.address ?? 'Location set'}
            </p>
            <p className="sheet-desc">{assignment.description}</p>

            <div className="eta-row">
              {routeLoading && <span className="empty-hint">Calculating route…</span>}
              {!routeLoading && route && (
                <>
                  <span className="eta-value">{fmtDuration(route.durationSeconds)}</span>
                  <span className="eta-sub">ETA</span>
                  <span className="eta-value">{fmtKm(route.distanceMeters)}</span>
                  <span className="eta-sub">
                    {route.engine === 'valhalla' ? 'route' : 'est.'}
                  </span>
                </>
              )}
            </div>

            {gpsError && <p className="gps-error">{gpsError}</p>}
          </div>
        )}
      </section>
    </div>
  );
}
