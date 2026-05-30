import type {
  Facility,
  Incident,
  IncidentPriority,
  Resource,
  ResourceType,
} from '../types';

// Color language for the common operating picture.
export const INCIDENT_PRIORITY_COLOR: Record<IncidentPriority, string> = {
  P1: '#ef4444', // red — life threatening
  P2: '#f59e0b', // amber — urgent
  P3: '#3b82f6', // blue — routine
};

export const RESOURCE_TYPE_COLOR: Record<ResourceType, string> = {
  EMS: '#22c55e', // green
  Fire: '#f97316', // orange
  Police: '#2563eb', // blue
};

export const FACILITY_COLOR = '#a855f7'; // purple

export function incidentColor(i: Incident): string {
  return INCIDENT_PRIORITY_COLOR[i.priority];
}

export function resourceColor(r: Resource): string {
  return RESOURCE_TYPE_COLOR[r.type];
}

export function facilityOpacity(f: Facility): number {
  // De-emphasize facilities that cannot receive patients.
  return f.status === 'Diversion' || f.status === 'Offline' ? 0.4 : 1;
}
