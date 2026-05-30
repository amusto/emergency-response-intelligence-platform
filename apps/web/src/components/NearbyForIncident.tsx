import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type {
  Incident,
  NearbyFacility,
  NearbyResource,
  SelectedEntity,
} from '../types';
import { FACILITY_COLOR, resourceColor } from '../lib/style';

interface Props {
  incident: Incident;
  onFocus: (entity: SelectedEntity) => void;
}

function fmtDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
}

/**
 * For a selected incident, shows the nearest responder units and care
 * facilities by PostGIS distance. This is the visible payoff of Phase 3.
 */
export default function NearbyForIncident({ incident, onFocus }: Props) {
  const [resources, setResources] = useState<NearbyResource[]>([]);
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    const { latitude: lat, longitude: lng } = incident.location;
    Promise.all([
      api.nearbyResources(lat, lng, { limit: 3 }),
      api.nearbyFacilities(lat, lng, { limit: 3 }),
    ])
      .then(([res, fac]) => {
        if (!active) return;
        setResources(res);
        setFacilities(fac);
      })
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [incident.id, incident.location]);

  if (loading) return <p className="empty-hint">Computing nearest units…</p>;
  if (error) return <p className="empty-hint">Proximity data unavailable.</p>;

  return (
    <div className="nearby">
      <div className="nearby-group">
        <span className="result-group-title">Nearest units</span>
        {resources.length === 0 && <p className="empty-hint">None in range.</p>}
        {resources.map((r) => (
          <button
            key={r.id}
            className="result-row"
            onClick={() => onFocus({ kind: 'resource', data: r })}
          >
            <span className="dot" style={{ background: resourceColor(r) }} />
            <span className="result-main">
              {r.unitNumber} <span className="result-sub">({r.type})</span>
            </span>
            <span className="result-sub">{fmtDistance(r.distanceMeters)}</span>
          </button>
        ))}
      </div>

      <div className="nearby-group">
        <span className="result-group-title">Nearest facilities</span>
        {facilities.length === 0 && <p className="empty-hint">None in range.</p>}
        {facilities.map((f) => (
          <button
            key={f.id}
            className="result-row"
            onClick={() => onFocus({ kind: 'facility', data: f })}
          >
            <span className="dot" style={{ background: FACILITY_COLOR }} />
            <span className="result-main">{f.name}</span>
            <span className="result-sub">{fmtDistance(f.distanceMeters)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
