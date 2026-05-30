import type { RouteResult, SelectedEntity } from '../types';
import RecommendedDispatch from './RecommendedDispatch';
import ReachableFacilities from './ReachableFacilities';

interface Props {
  selected: SelectedEntity;
  onClear: () => void;
  onFocus: (entity: SelectedEntity) => void;
  onRoute: (result: RouteResult) => void;
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="detail-row">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  );
}

export default function DetailsPanel({ selected, onClear, onFocus, onRoute }: Props) {
  if (!selected) {
    return (
      <section className="panel">
        <h2 className="panel-title">Details</h2>
        <p className="empty-hint">Select a map marker to inspect it.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Details</h2>
        <button className="clear-btn" onClick={onClear}>
          Clear
        </button>
      </div>

      {selected.kind === 'incident' && (
        <div className="detail-body">
          <h3 className="detail-heading">{selected.data.type}</h3>
          <Row label="Priority" value={selected.data.priority} />
          <Row label="Status" value={selected.data.status} />
          <Row label="Address" value={selected.data.location.address ?? '—'} />
          <Row
            label="Reported"
            value={new Date(selected.data.reportedAt).toLocaleString()}
          />
          <p className="detail-desc">{selected.data.description}</p>
          <RecommendedDispatch
            incident={selected.data}
            onFocus={onFocus}
            onRoute={onRoute}
          />
          <ReachableFacilities incident={selected.data} onFocus={onFocus} />
        </div>
      )}

      {selected.kind === 'resource' && (
        <div className="detail-body">
          <h3 className="detail-heading">{selected.data.unitNumber}</h3>
          <Row label="Type" value={selected.data.type} />
          <Row label="Status" value={selected.data.status} />
          <Row
            label="Assigned to"
            value={selected.data.assignedIncidentId ?? 'Unassigned'}
          />
        </div>
      )}

      {selected.kind === 'facility' && (
        <div className="detail-body">
          <h3 className="detail-heading">{selected.data.name}</h3>
          <Row label="Type" value={selected.data.type} />
          <Row label="Status" value={selected.data.status} />
          <Row
            label="Available beds"
            value={selected.data.availableBeds ?? '—'}
          />
        </div>
      )}
    </section>
  );
}
