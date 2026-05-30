import { Facility } from '../common/domain';

/**
 * Seeded facilities around San Francisco, CA.
 * Phase 1 data source — replaced by PostGIS-backed storage in a later phase.
 */
export const FACILITIES: Facility[] = [
  {
    id: 'fac-001',
    name: 'Zuckerberg San Francisco General Hospital',
    type: 'Hospital',
    status: 'Operational',
    latitude: 37.7559,
    longitude: -122.4047,
    availableBeds: 12,
  },
  {
    id: 'fac-002',
    name: 'UCSF Medical Center at Parnassus',
    type: 'Hospital',
    status: 'Operational',
    latitude: 37.7631,
    longitude: -122.4576,
    availableBeds: 8,
  },
  {
    id: 'fac-003',
    name: 'CPMC Van Ness Campus Emergency Room',
    type: 'Emergency Room',
    status: 'Limited',
    latitude: 37.7889,
    longitude: -122.4214,
    availableBeds: 3,
  },
  {
    id: 'fac-004',
    name: 'Kaiser Permanente SF Emergency Room',
    type: 'Emergency Room',
    status: 'Diversion',
    latitude: 37.7726,
    longitude: -122.4441,
    availableBeds: 0,
  },
  {
    id: 'fac-005',
    name: 'Mission Neighborhood Health Clinic',
    type: 'Clinic',
    status: 'Operational',
    latitude: 37.7599,
    longitude: -122.4148,
  },
  {
    id: 'fac-006',
    name: 'Chinatown Public Health Clinic',
    type: 'Clinic',
    status: 'Operational',
    latitude: 37.7955,
    longitude: -122.4078,
  },
  {
    id: 'fac-007',
    name: 'St. Francis Memorial Hospital',
    type: 'Hospital',
    status: 'Operational',
    latitude: 37.7894,
    longitude: -122.4173,
    availableBeds: 6,
  },
];
