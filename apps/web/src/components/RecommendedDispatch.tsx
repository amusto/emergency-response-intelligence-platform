import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type {
  DispatchRecommendations,
  Incident,
  RouteResult,
  SelectedEntity,
} from '../types';
import { resourceColor } from '../lib/style';

interface Props {
  incident: Incident;
  onFocus: (entity: SelectedEntity) => void;
  onRoute: (result: RouteResult) => void;
}

function fmtEta(seconds: number): string {
  const m = Math.max(1, Math.round(seconds / 60));
  return `${m} min`;
}

/**
 * Phase 5 — ranked dispatch recommendations for the selected incident.
 * Pulls /dispatch/recommendations (travel time + availability + agency match)
 * and lets the operator focus or route a recommended unit.
 */
export default function RecommendedDispatch({ incident, onFocus, onRoute }: Props) {
  const [data, setData] = useState<DispatchRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [routingId, setRoutingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    api
      .dispatchRecommendations(incident.id)
      .then((r) => active && setData(r))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [incident.id]);

  const routeFrom = (lat: number, lng: number, id: string) => {
    setRoutingId(id);
    api
      .route(
        { lat, lng },
        { lat: incident.location.latitude, lng: incident.location.longitude },
      )
      .then(onRoute)
      .finally(() => setRoutingId(null));
  };

  return (
    <div className="nearby">
      <div className="nearby-group">
        <span className="result-group-title">Recommended dispatch</span>

        {loading && <p className="empty-hint">Ranking available units…</p>}
        {error && <p className="empty-hint">Recommendations unavailable.</p>}
        {!loading && !error && data && data.recommendations.length === 0 && (
          <p className="empty-hint">No available units match this incident.</p>
        )}

        {!loading &&
          !error &&
          data?.recommendations.map((rec) => (
            <div key={rec.resource.id} className="rec-row">
              <button
                className="result-row-main-btn"
                onClick={() => onFocus({ kind: 'resource', data: rec.resource })}
              >
                <span
                  className="dot"
                  style={{ background: resourceColor(rec.resource) }}
                />
                <span className="result-main">
                  {rec.resource.unitNumber}{' '}
                  <span className={`role-badge role-badge--${rec.agencyRole}`}>
                    {rec.agencyRole}
                  </span>
                </span>
                <span className="result-sub">{fmtEta(rec.etaSeconds)}</span>
              </button>
              <button
                className="route-btn"
                disabled={routingId === rec.resource.id}
                onClick={() =>
                  routeFrom(
                    rec.resource.latitude,
                    rec.resource.longitude,
                    rec.resource.id,
                  )
                }
              >
                {routingId === rec.resource.id ? '…' : 'Route'}
              </button>
              <p className="rec-rationale">{rec.rationale}</p>
            </div>
          ))}

        {!loading && !error && data && (
          <p className="coverage-note">
            Available now:{' '}
            {data.availableByType
              .map((c) => `${c.available} ${c.type}`)
              .join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
}
