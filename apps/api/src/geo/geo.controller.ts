import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { NearbyFacility, NearbyResource, ResourceType } from '../common/domain';
import { GeoService } from './geo.service';

const DEFAULT_RADIUS_METERS = 5000;
const DEFAULT_LIMIT = 10;
const RESOURCE_TYPES: ResourceType[] = ['EMS', 'Fire', 'Police'];

@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('nearby-facilities')
  nearbyFacilities(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('limit') limit?: string,
  ): Promise<NearbyFacility[]> {
    return this.geoService.nearbyFacilities(this.parseQuery(lat, lng, radius, limit));
  }

  @Get('nearby-resources')
  nearbyResources(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radius') radius?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: string,
  ): Promise<NearbyResource[]> {
    const base = this.parseQuery(lat, lng, radius, limit);
    let resourceType: ResourceType | undefined;
    if (type) {
      if (!RESOURCE_TYPES.includes(type as ResourceType)) {
        throw new BadRequestException(
          `type must be one of: ${RESOURCE_TYPES.join(', ')}`,
        );
      }
      resourceType = type as ResourceType;
    }
    return this.geoService.nearbyResources({ ...base, type: resourceType });
  }

  private parseQuery(
    lat: string,
    lng: string,
    radius?: string,
    limit?: string,
  ): { lat: number; lng: number; radiusMeters: number; limit: number } {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
      throw new BadRequestException('lat and lng are required numeric query params');
    }
    if (parsedLat < -90 || parsedLat > 90 || parsedLng < -180 || parsedLng > 180) {
      throw new BadRequestException('lat/lng out of range');
    }

    const radiusMeters = radius !== undefined ? Number(radius) : DEFAULT_RADIUS_METERS;
    const lim = limit !== undefined ? Number(limit) : DEFAULT_LIMIT;
    if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) {
      throw new BadRequestException('radius must be a positive number (metres)');
    }
    if (!Number.isInteger(lim) || lim <= 0 || lim > 100) {
      throw new BadRequestException('limit must be an integer between 1 and 100');
    }

    return { lat: parsedLat, lng: parsedLng, radiusMeters, limit: lim };
  }
}
