import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import type { SearchResults, SelectedEntity } from '../types';
import {
  FACILITY_COLOR,
  incidentColor,
  resourceColor,
} from '../lib/style';

interface Props {
  onSelectResult: (entity: SelectedEntity) => void;
}

const EMPTY: SearchResults = {
  query: '',
  total: 0,
  incidents: [],
  resources: [],
  facilities: [],
};

export default function SearchPanel({ onSelectResult }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim();
    if (!q) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      let active = true;
      api
        .search(q)
        .then((r) => active && setResults(r))
        .catch(() => active && setResults(EMPTY))
        .finally(() => active && setLoading(false));
      return () => {
        active = false;
      };
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const hasQuery = query.trim().length > 0;

  return (
    <section className="panel">
      <h2 className="panel-title">Search</h2>
      <div className="search-box">
        <input
          className="search-input"
          type="text"
          value={query}
          placeholder="Units, incidents, facilities…"
          onChange={(e) => setQuery(e.target.value)}
        />
        {hasQuery && (
          <button className="clear-btn" onClick={() => setQuery('')}>
            ✕
          </button>
        )}
      </div>

      {hasQuery && (
        <div className="search-results">
          {loading && <p className="empty-hint">Searching…</p>}

          {!loading && results.total === 0 && (
            <p className="empty-hint">No matches for “{query.trim()}”.</p>
          )}

          {!loading && results.incidents.length > 0 && (
            <div className="result-group">
              <span className="result-group-title">
                Incidents ({results.incidents.length})
              </span>
              {results.incidents.map((i) => (
                <button
                  key={i.id}
                  className="result-row"
                  onClick={() => onSelectResult({ kind: 'incident', data: i })}
                >
                  <span className="dot" style={{ background: incidentColor(i) }} />
                  <span className="result-main">
                    {i.priority} {i.type}
                  </span>
                  <span className="result-sub">{i.status}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && results.resources.length > 0 && (
            <div className="result-group">
              <span className="result-group-title">
                Resources ({results.resources.length})
              </span>
              {results.resources.map((r) => (
                <button
                  key={r.id}
                  className="result-row"
                  onClick={() => onSelectResult({ kind: 'resource', data: r })}
                >
                  <span className="dot" style={{ background: resourceColor(r) }} />
                  <span className="result-main">{r.unitNumber}</span>
                  <span className="result-sub">{r.status}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && results.facilities.length > 0 && (
            <div className="result-group">
              <span className="result-group-title">
                Facilities ({results.facilities.length})
              </span>
              {results.facilities.map((f) => (
                <button
                  key={f.id}
                  className="result-row"
                  onClick={() => onSelectResult({ kind: 'facility', data: f })}
                >
                  <span className="dot" style={{ background: FACILITY_COLOR }} />
                  <span className="result-main">{f.name}</span>
                  <span className="result-sub">{f.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
