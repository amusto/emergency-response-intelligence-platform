import { Resource } from '../common/domain';

/**
 * Seeded responder units around San Francisco, CA.
 * Phase 1 data source — replaced by PostGIS-backed storage in a later phase.
 */
export const RESOURCES: Resource[] = [
  {
    id: 'res-001',
    unitNumber: 'Medic 14',
    type: 'EMS',
    status: 'Available',
    latitude: 37.7621,
    longitude: -122.4197,
  },
  {
    id: 'res-002',
    unitNumber: 'Medic 22',
    type: 'EMS',
    status: 'Enroute',
    latitude: 37.7702,
    longitude: -122.4330,
    assignedIncidentId: 'inc-001',
  },
  {
    id: 'res-003',
    unitNumber: 'Engine 7',
    type: 'Fire',
    status: 'Available',
    latitude: 37.7785,
    longitude: -122.4126,
  },
  {
    id: 'res-004',
    unitNumber: 'Truck 3',
    type: 'Fire',
    status: 'OnScene',
    latitude: 37.7840,
    longitude: -122.4080,
    assignedIncidentId: 'inc-003',
  },
  {
    id: 'res-005',
    unitNumber: 'Unit 1A12',
    type: 'Police',
    status: 'Available',
    latitude: 37.7680,
    longitude: -122.4250,
  },
  {
    id: 'res-006',
    unitNumber: 'Unit 3B07',
    type: 'Police',
    status: 'Enroute',
    latitude: 37.7588,
    longitude: -122.4090,
    assignedIncidentId: 'inc-002',
  },
  {
    id: 'res-007',
    unitNumber: 'Medic 9',
    type: 'EMS',
    status: 'OutOfService',
    latitude: 37.7910,
    longitude: -122.4350,
  },
  {
    id: 'res-008',
    unitNumber: 'Engine 13',
    type: 'Fire',
    status: 'Available',
    latitude: 37.7548,
    longitude: -122.4310,
  },
];
