import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { IsochroneResult, ReachabilityResult, RouteResult } from '../common/domain';
import { RoutingService } from './routing.service';
import { ReachabilityService, ReachableKind } from './reachability.service';

const COSTING = ['auto', 'truck', 'bicycle', 'pedestrian'];

@Controller('routing')
export class RoutingController {
  constructor(
    private readonly routingService: RoutingService,
    private readonly reachabilityService: ReachabilityService,
  ) {}

  @Get('route')
  route(
    @Query('fromLat') fromLat: string,
    @Query('fromLng') fromLng: string,
    @Query('toLat') toLat: string,
    @Query('toLng') toLng: string,
    @Query('costing') costing?: string,
    @Query('alternates') alternates?: string,
  ): Promise<RouteResult> {
    const from = this.point(fromLat, fromLng, 'from');
    const to = this.point(toLat, toLng, 'to');
    const alt = alternates !== undefined ? Number(alternates) : 0;
    if (!Number.isInteger(alt) || alt < 0 || alt > 3) {
      throw new BadRequestException('alternates must be an integer 0–3');
    }
    return this.routingService.route(from, to, this.costing(costing), alt);
  }

  @Get('isochrone')
  isochrone(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('contours') contours?: string,
    @Query('costing') costing?: string,
  ): Promise<IsochroneResult> {
    const center = this.point(lat, lng, 'center');
    const minutes = this.parseContours(contours);
    return this.routingService.isochrone(center, minutes, this.costing(costing));
  }

  @Get('reachable')
  reachable(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('minutes') minutes?: string,
    @Query('kind') kind?: string,
    @Query('limit') limit?: string,
  ): Promise<ReachabilityResult> {
    const origin = this.point(lat, lng, 'origin');
    const mins = minutes !== undefined ? Number(minutes) : 15;
    if (!Number.isFinite(mins) || mins <= 0 || mins > 120) {
      throw new BadRequestException('minutes must be a number between 1 and 120');
    }
    if (kind && kind !== 'facilities' && kind !== 'resources') {
      throw new BadRequestException("kind must be 'facilities' or 'resources'");
    }
    const lim = limit !== undefined ? Number(limit) : 20;
    if (!Number.isInteger(lim) || lim <= 0 || lim > 100) {
      throw new BadRequestException('limit must be an integer between 1 and 100');
    }
    return this.reachabilityService.reachable(
      (kind as ReachableKind) ?? 'facilities',
      origin.lat,
      origin.lng,
      mins,
      lim,
    );
  }

  private point(lat: string, lng: string, label: string) {
    const la = Number(lat);
    const ln = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(ln)) {
      throw new BadRequestException(`${label} lat/lng are required numeric params`);
    }
    if (la < -90 || la > 90 || ln < -180 || ln > 180) {
      throw new BadRequestException(`${label} lat/lng out of range`);
    }
    return { lat: la, lng: ln };
  }

  private costing(costing?: string): string {
    if (costing && !COSTING.includes(costing)) {
      throw new BadRequestException(`costing must be one of: ${COSTING.join(', ')}`);
    }
    return costing ?? 'auto';
  }

  private parseContours(contours?: string): number[] {
    if (!contours) return [5, 10, 15];
    const minutes = contours
      .split(',')
      .map((c) => Number(c.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (minutes.length === 0) {
      throw new BadRequestException('contours must be a comma-separated list of minutes');
    }
    return minutes;
  }
}
