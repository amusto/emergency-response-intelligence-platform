import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Incident, NearbyFacility, SelectedEntity } from '../types';
import { FACILITY_COLOR } from '../lib/style';

interface Props {
  incident: Incident;
  onFocus: (entity: SelectedEntity) => void;
}

function fmtDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
}

/**
 * Nearest care facilities to the selected incident, by PostGIS distance.
 * (Responder units are handled by RecommendedDispatch — Phase 5.)
 */
export default function NearbyForIncident({ incident, onFocus }: Props) {
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    const { latitude: lat, longitude: lng } = incident.location;
    api
      .nearbyFacilities(lat, lng, { limit: 3 })
      .then((fac) => active && setFacilities(fac))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [incident.id, incident.location]);

  return (
    <div className="nearby">
      <div className="nearby-group">
        <span className="result-group-title">Nearest facilities</span>
        {loading && <p className="empty-hint">Finding nearest facilities…</p>}
        {error && <p className="empty-hint">Proximity data unavailable.</p>}
        {!loading && !error && facilities.length === 0 && (
          <p className="empty-hint">None in range.</p>
        )}
        {!loading &&
          !error &&
          facilities.map((f) => (
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
