import { Incident } from '../common/domain';

/**
 * Seeded active incidents around San Francisco, CA.
 * Phase 1 data source — replaced by PostGIS-backed storage in a later phase.
 */
export const INCIDENTS: Incident[] = [
  {
    id: 'inc-001',
    type: 'Medical Emergency',
    priority: 'P1',
    status: 'Dispatched',
    location: {
      latitude: 37.7715,
      longitude: -122.4280,
      address: '450 Hayes St, San Francisco, CA',
    },
    description: 'Cardiac arrest, 60yo male, CPR in progress by bystander.',
    reportedAt: '2026-05-29T18:42:00Z',
  },
  {
    id: 'inc-002',
    type: 'Traffic Accident',
    priority: 'P2',
    status: 'Dispatched',
    location: {
      latitude: 37.7561,
      longitude: -122.4101,
      address: 'Cesar Chavez St & Mission St, San Francisco, CA',
    },
    description: 'Two-vehicle collision, possible injuries, lane blocked.',
    reportedAt: '2026-05-29T18:55:00Z',
  },
  {
    id: 'inc-003',
    type: 'Structure Fire',
    priority: 'P1',
    status: 'Active',
    location: {
      latitude: 37.7848,
      longitude: -122.4085,
      address: '835 Geary St, San Francisco, CA',
    },
    description: 'Working fire, 3-story residential building, occupants reported.',
    reportedAt: '2026-05-29T18:30:00Z',
  },
  {
    id: 'inc-004',
    type: 'Medical Emergency',
    priority: 'P3',
    status: 'Active',
    location: {
      latitude: 37.7640,
      longitude: -122.4530,
      address: 'Golden Gate Park, San Francisco, CA',
    },
    description: 'Cyclist down, minor injuries, conscious and alert.',
    reportedAt: '2026-05-29T19:05:00Z',
  },
  {
    id: 'inc-005',
    type: 'Traffic Accident',
    priority: 'P2',
    status: 'Contained',
    location: {
      latitude: 37.7929,
      longitude: -122.3994,
      address: 'Embarcadero & Washington St, San Francisco, CA',
    },
    description: 'Vehicle vs. pedestrian, patient transported, scene clearing.',
    reportedAt: '2026-05-29T17:48:00Z',
  },
];
