import { Injectable } from '@nestjs/common';
import {
  Facility,
  Reachable,
  ReachabilityResult,
  Resource,
  RoutingEngine,
} from '../common/domain';
import { FacilitiesService } from '../facilities/facilities.service';
import { ResourcesService } from '../resources/resources.service';
import { RoutingService } from './routing.service';

export type ReachableKind = 'facilities' | 'resources';

@Injectable()
export class ReachabilityService {
  constructor(
    private readonly facilities: FacilitiesService,
    private readonly resources: ResourcesService,
    private readonly routing: RoutingService,
  ) {}

  /**
   * Which entities of `kind` are reachable from the origin within `minutes`,
   * by routed travel time. Each candidate is routed individually (Valhalla or
   * the straight-line fallback), then filtered by the time budget and sorted
   * fastest-first.
   */
  async reachable(
    kind: ReachableKind,
    lat: number,
    lng: number,
    minutes: number,
    limit: number,
  ): Promise<ReachabilityResult> {
    const origin = { lat, lng };
    const budgetSeconds = minutes * 60;

    const targets =
      kind === 'facilities'
        ? await this.facilities.findAll()
        : await this.resources.findAll();

    let engine: RoutingEngine = 'valhalla';
    const scored = await Promise.all(
      targets.map(async (t: Facility | Resource) => {
        const route = await this.routing.route(
          origin,
          { lat: t.latitude, lng: t.longitude },
          'auto',
        );
        engine = route.engine;
        return {
          ...t,
          etaSeconds: route.durationSeconds,
          distanceMeters: route.distanceMeters,
        };
      }),
    );

    const items = scored
      .filter((s) => s.etaSeconds <= budgetSeconds)
      .sort((a, b) => a.etaSeconds - b.etaSeconds)
      .slice(0, limit);

    return {
      kind,
      minutes,
      origin,
      engine,
      items: items as Reachable<Facility>[] | Reachable<Resource>[],
    };
  }
}
