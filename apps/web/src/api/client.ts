import type { Facility, Incident, Resource } from '../types';

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
};
