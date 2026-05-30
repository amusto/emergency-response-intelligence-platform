import { Injectable } from '@nestjs/common';
import {
  AgencyRole,
  DispatchRecommendation,
  DispatchRecommendations,
  Incident,
  IncidentType,
  ResourceType,
} from '../common/domain';
import { IncidentsService } from '../incidents/incidents.service';
import { ResourcesService } from '../resources/resources.service';
import { RoutingService } from '../routing/routing.service';

/**
 * Which agency types respond to each incident type, in priority order. The
 * first entry is the primary agency; the rest provide support.
 */
const PREFERRED_AGENCIES: Record<IncidentType, ResourceType[]> = {
  'Medical Emergency': ['EMS'],
  'Structure Fire': ['Fire', 'Police'],
  'Traffic Accident': ['EMS', 'Police', 'Fire'],
};

const ALL_TYPES: ResourceType[] = ['EMS', 'Fire', 'Police'];

@Injectable()
export class DispatchService {
  constructor(
    private readonly incidents: IncidentsService,
    private readonly resources: ResourcesService,
    private readonly routing: RoutingService,
  ) {}

  /**
   * Rank units for an incident. Eligible units are Available and belong to an
   * agency that responds to the incident type. Each is routed to the incident
   * for an ETA; results are ordered primary-agency-first, then fastest ETA.
   */
  async recommend(incidentId: string, limit = 3): Promise<DispatchRecommendations> {
    const incident = await this.incidents.findOne(incidentId); // 404 if missing
    const all = await this.resources.findAll();
    const preferred = PREFERRED_AGENCIES[incident.type];

    const eligible = all.filter(
      (r) => r.status === 'Available' && preferred.includes(r.type),
    );

    const dest = {
      lat: incident.location.latitude,
      lng: incident.location.longitude,
    };

    const scored = await Promise.all(
      eligible.map(async (r) => {
        const route = await this.routing.route(
          { lat: r.latitude, lng: r.longitude },
          dest,
          'auto',
        );
        const agencyRole: AgencyRole =
          preferred[0] === r.type ? 'primary' : 'support';
        return {
          resource: r,
          etaSeconds: route.durationSeconds,
          distanceMeters: route.distanceMeters,
          routingEngine: route.engine,
          agencyRole,
        };
      }),
    );

    // Primary agency first, then fastest ETA.
    scored.sort((a, b) => {
      if (a.agencyRole !== b.agencyRole) {
        return a.agencyRole === 'primary' ? -1 : 1;
      }
      return a.etaSeconds - b.etaSeconds;
    });

    const recommendations: DispatchRecommendation[] = scored
      .slice(0, limit)
      .map((s) => ({ ...s, rationale: this.rationale(s, incident) }));

    const availableByType = ALL_TYPES.map((type) => ({
      type,
      available: all.filter((r) => r.type === type && r.status === 'Available')
        .length,
    }));

    return {
      incidentId,
      generatedAt: new Date().toISOString(),
      recommendations,
      availableByType,
    };
  }

  private rationale(
    s: { resource: { type: ResourceType }; etaSeconds: number; distanceMeters: number; agencyRole: AgencyRole },
    incident: Incident,
  ): string {
    const mins = Math.max(1, Math.round(s.etaSeconds / 60));
    const km = (s.distanceMeters / 1000).toFixed(1);
    const role =
      s.agencyRole === 'primary'
        ? `${s.resource.type} is the primary agency for a ${incident.type}`
        : `${s.resource.type} provides support for a ${incident.type}`;
    return `~${mins} min ETA · ${km} km · ${role}.`;
  }
}
