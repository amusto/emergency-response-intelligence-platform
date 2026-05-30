import type {
  DispatchRecommendations,
  Facility,
  Incident,
  NearbyFacility,
  NearbyResource,
  Resource,
  RouteResult,
  SearchResults,
} from '../types';

// Requests go to /api, which Vite proxies in dev and nginx proxies in Docker.
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getFacilities: () => getJson<Facility[]>('/facilities'),
  getResources: () => getJson<Resource[]>('/resources'),
  getIncidents: () => getJson<Incident[]>('/incidents'),
  search: (q: string) =>
    getJson<SearchResults>(`/search?q=${encodeURIComponent(q)}`),
  nearbyResources: (
    lat: number,
    lng: number,
    opts: { radius?: number; limit?: number; type?: string } = {},
  ) => {
    const p = new URLSearchParams({ lat: String(lat), lng: String(lng) });
    if (opts.radius) p.set('radius', String(opts.radius));
    if (opts.limit) p.set('limit', String(opts.limit));
    if (opts.type) p.set('type', opts.type);
    return getJson<NearbyResource[]>(`/geo/nearby-resources?${p.toString()}`);
  },
  nearbyFacilities: (
    lat: number,
    lng: number,
    opts: { radius?: number; limit?: number } = {},
  ) => {
    const p = new URLSearchParams({ lat: String(lat), lng: String(lng) });
    if (opts.radius) p.set('radius', String(opts.radius));
    if (opts.limit) p.set('limit', String(opts.limit));
    return getJson<NearbyFacility[]>(`/geo/nearby-facilities?${p.toString()}`);
  },
  route: (
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
    costing?: string,
  ) => {
    const p = new URLSearchParams({
      fromLat: String(from.lat),
      fromLng: String(from.lng),
      toLat: String(to.lat),
      toLng: String(to.lng),
    });
    if (costing) p.set('costing', costing);
    return getJson<RouteResult>(`/routing/route?${p.toString()}`);
  },
  dispatchRecommendations: (incidentId: string, limit = 3) =>
    getJson<DispatchRecommendations>(
      `/dispatch/recommendations?incidentId=${encodeURIComponent(incidentId)}&limit=${limit}`,
    ),
};
