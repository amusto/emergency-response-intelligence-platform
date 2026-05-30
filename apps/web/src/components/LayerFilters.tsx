import type { LayerKey } from '../types';
import {
  FACILITY_COLOR,
  INCIDENT_PRIORITY_COLOR,
  RESOURCE_TYPE_COLOR,
} from '../lib/style';

interface Props {
  visibleLayers: Record<LayerKey, boolean>;
  counts: Record<LayerKey, number>;
  onToggle: (layer: LayerKey) => void;
}

const LAYERS: { key: LayerKey; label: string }[] = [
  { key: 'incidents', label: 'Incidents' },
  { key: 'resources', label: 'Resources' },
  { key: 'facilities', label: 'Facilities' },
];

export default function LayerFilters({ visibleLayers, counts, onToggle }: Props) {
  return (
    <section className="panel">
      <h2 className="panel-title">Layers</h2>
      <div className="layer-list">
        {LAYERS.map(({ key, label }) => (
          <label key={key} className="layer-row">
            <input
              type="checkbox"
              checked={visibleLayers[key]}
              onChange={() => onToggle(key)}
            />
            <span className="layer-label">{label}</span>
            <span className="layer-count">{counts[key]}</span>
          </label>
        ))}
      </div>

      <h3 className="legend-title">Legend</h3>
      <div className="legend">
        <div className="legend-group">
          <span className="legend-group-label">Incident priority</span>
          {Object.entries(INCIDENT_PRIORITY_COLOR).map(([k, c]) => (
            <span key={k} className="legend-item">
              <span className="dot" style={{ background: c }} />
              {k}
            </span>
          ))}
        </div>
        <div className="legend-group">
          <span className="legend-group-label">Resource type</span>
          {Object.entries(RESOURCE_TYPE_COLOR).map(([k, c]) => (
            <span key={k} className="legend-item">
              <span className="dot" style={{ background: c }} />
              {k}
            </span>
          ))}
        </div>
        <div className="legend-group">
          <span className="legend-group-label">Facility</span>
          <span className="legend-item">
            <span className="dot" style={{ background: FACILITY_COLOR }} />
            Care site
          </span>
        </div>
      </div>
    </section>
  );
}
