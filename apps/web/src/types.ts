// Frontend mirror of the backend domain contract (apps/api/src/common/domain.ts).

export type FacilityType = 'Hospital' | 'Emergency Room' | 'Clinic';
export type FacilityStatus = 'Operational' | 'Limited' | 'Diversion' | 'Offline';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  status: FacilityStatus;
  latitude: number;
  longitude: number;
  availableBeds?: number;
}

export type ResourceType = 'EMS' | 'Fire' | 'Police';
export type ResourceStatus = 'Available' | 'Enroute' | 'OnScene' | 'OutOfService';

export interface Resource {
  id: string;
  unitNumber: string;
  type: ResourceType;
  status: ResourceStatus;
  latitude: number;
  longitude: number;
  assignedIncidentId?: string;
}

export type IncidentType =
  | 'Medical Emergency'
  | 'Traffic Accident'
  | 'Structure Fire';
export type IncidentPriority = 'P1' | 'P2' | 'P3';
export type IncidentStatus = 'Active' | 'Dispatched' | 'Contained' | 'Resolved';

export interface IncidentLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  location: IncidentLocation;
  description: string;
  reportedAt: string;
}

export type RoutingEngine = 'valhalla' | 'straight-line';

export interface RouteResult {
  engine: RoutingEngine;
  costing: string;
  distanceMeters: number;
  durationSeconds: number;
  geometry: [number, number][];
}

export type WithDistance<T> = T & { distanceMeters: number };
export type NearbyFacility = WithDistance<Facility>;
export type NearbyResource = WithDistance<Resource>;

export interface SearchResults {
  query: string;
  total: number;
  incidents: Incident[];
  resources: Resource[];
  facilities: Facility[];
}

export type LayerKey = 'incidents' | 'resources' | 'facilities';

/** A geographic point the map should fly to, with a nonce to retrigger. */
export interface MapFocusTarget {
  lat: number;
  lng: number;
  nonce: number;
}

export type SelectedEntity =
  | { kind: 'incident'; data: Incident }
  | { kind: 'resource'; data: Resource }
  | { kind: 'facility'; data: Facility }
  | null;
