/**
 * Shared domain types for the Emergency Response Intelligence Platform.
 *
 * Phase 1 serves these from seeded JSON. In later phases the same shapes
 * are backed by PostgreSQL + PostGIS without changing the API contract.
 */

export type FacilityType = 'Hospital' | 'Emergency Room' | 'Clinic';
export type FacilityStatus = 'Operational' | 'Limited' | 'Diversion' | 'Offline';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  status: FacilityStatus;
  latitude: number;
  longitude: number;
  /** Available emergency-department beds, for situational awareness. */
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
  /** Incident this unit is currently assigned to, if any. */
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
