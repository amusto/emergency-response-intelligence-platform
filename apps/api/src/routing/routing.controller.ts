import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { IsochroneResult, RouteResult } from '../common/domain';
import { RoutingService } from './routing.service';

const COSTING = ['auto', 'truck', 'bicycle', 'pedestrian'];

@Controller('routing')
export class RoutingController {
  constructor(private readonly routingService: RoutingService) {}

  @Get('route')
  route(
    @Query('fromLat') fromLat: string,
    @Query('fromLng') fromLng: string,
    @Query('toLat') toLat: string,
    @Query('toLng') toLng: string,
    @Query('costing') costing?: string,
  ): Promise<RouteResult> {
    const from = this.point(fromLat, fromLng, 'from');
    const to = this.point(toLat, toLng, 'to');
    return this.routingService.route(from, to, this.costing(costing));
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
