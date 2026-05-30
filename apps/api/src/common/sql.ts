import { Facility, Incident, Resource } from './domain';

/**
 * Reusable SELECT column lists and row mappers shared by the entity services
 * and the geo service. Latitude/longitude are derived from the geography
 * column via ST_Y/ST_X so the API contract stays identical to Phase 1/2.
 */

export const FACILITY_COLUMNS = `
  id,
  name,
  type,
  status,
  available_beds AS "availableBeds",
  ST_Y(geom::geometry) AS latitude,
  ST_X(geom::geometry) AS longitude`;

export const RESOURCE_COLUMNS = `
  id,
  unit_number AS "unitNumber",
  type,
  status,
  assigned_incident_id AS "assignedIncidentId",
  ST_Y(geom::geometry) AS latitude,
  ST_X(geom::geometry) AS longitude`;

export const INCIDENT_COLUMNS = `
  id,
  type,
  priority,
  status,
  address,
  description,
  reported_at AS "reportedAt",
  ST_Y(geom::geometry) AS latitude,
  ST_X(geom::geometry) AS longitude`;

export interface FacilityRow {
  id: string;
  name: string;
  type: Facility['type'];
  status: Facility['status'];
  availableBeds: number | null;
  latitude: number;
  longitude: number;
  distanceMeters?: number;
}

export interface ResourceRow {
  id: string;
  unitNumber: string;
  type: Resource['type'];
  status: Resource['status'];
  assignedIncidentId: string | null;
  latitude: number;
  longitude: number;
  distanceMeters?: number;
}

export interface IncidentRow {
  id: string;
  type: Incident['type'];
  priority: Incident['priority'];
  status: Incident['status'];
  address: string | null;
  description: string;
  reportedAt: Date | string;
  latitude: number;
  longitude: number;
}

export function mapFacility(row: FacilityRow): Facility {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    status: row.status,
    availableBeds: row.availableBeds ?? undefined,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
  };
}

export function mapResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    unitNumber: row.unitNumber,
    type: row.type,
    status: row.status,
    assignedIncidentId: row.assignedIncidentId ?? undefined,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
  };
}

export function mapIncident(row: IncidentRow): Incident {
  return {
    id: row.id,
    type: row.type,
    priority: row.priority,
    status: row.status,
    description: row.description,
    reportedAt:
      row.reportedAt instanceof Date
        ? row.reportedAt.toISOString()
        : row.reportedAt,
    location: {
      latitude: Number(row.latitude),
      longitude: Number(row.longitude),
      address: row.address ?? undefined,
    },
  };
}
