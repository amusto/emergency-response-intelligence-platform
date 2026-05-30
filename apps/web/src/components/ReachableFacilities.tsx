import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type {
  Facility,
  Incident,
  Reachable,
  SelectedEntity,
} from '../types';
import { FACILITY_COLOR } from '../lib/style';

interface Props {
  incident: Incident;
  onFocus: (entity: SelectedEntity) => void;
}

const OPTIONS = [5, 10, 15];

function fmtEta(seconds: number): string {
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

/**
 * Phase 7 — travel-time reachability. Lists care facilities reachable from the
 * incident within a selectable time budget, by routed ETA (Valhalla or the
 * straight-line fallback). Answers "what hospitals can we reach in N minutes?"
 */
export default function ReachableFacilities({ incident, onFocus }: Props) {
  const [minutes, setMinutes] = useState(15);
  const [items, setItems] = useState<Reachable<Facility>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    api
      .reachableFacilities(
        incident.location.latitude,
        incident.location.longitude,
        minutes,
      )
      .then((r) => active && setItems(r.items as Reachable<Facility>[]))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [incident.id, incident.location, minutes]);

  return (
    <div className="nearby">
      <div className="nearby-group">
        <div className="reach-header">
          <span className="result-group-title">Reachable facilities</span>
          <div className="reach-toggle">
            {OPTIONS.map((m) => (
              <button
                key={m}
                className={`reach-opt${m === minutes ? ' reach-opt--on' : ''}`}
                onClick={() => setMinutes(m)}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="empty-hint">Computing reachability…</p>}
        {error && <p className="empty-hint">Reachability unavailable.</p>}
        {!loading && !error && items.length === 0 && (
          <p className="empty-hint">No facilities reachable within {minutes} min.</p>
        )}

        {!loading &&
          !error &&
          items.map((f) => (
            <button
              key={f.id}
              className="result-row"
              onClick={() => onFocus({ kind: 'facility', data: f })}
            >
              <span className="dot" style={{ background: FACILITY_COLOR }} />
              <span className="result-main">{f.name}</span>
              <span className="result-sub">{fmtEta(f.etaSeconds)}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
