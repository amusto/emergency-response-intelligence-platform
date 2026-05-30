import { Injectable } from '@nestjs/common';
import { NearbyFacility, NearbyResource, ResourceType } from '../common/domain';
import { DatabaseService } from '../database/database.service';
import {
  FACILITY_COLUMNS,
  FacilityRow,
  mapFacility,
  RESOURCE_COLUMNS,
  ResourceRow,
  mapResource,
} from '../common/sql';

export interface NearbyQuery {
  lat: number;
  lng: number;
  /** Search radius in metres. */
  radiusMeters: number;
  limit: number;
}

@Injectable()
export class GeoService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Facilities within `radiusMeters` of the point, nearest first.
   * Uses ST_DWithin (GiST-indexed) to filter and ST_Distance to rank/report.
   */
  async nearbyFacilities(q: NearbyQuery): Promise<NearbyFacility[]> {
    const point = 'ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography';
    const { rows } = await this.db.query<FacilityRow>(
      `SELECT ${FACILITY_COLUMNS},
              ST_Distance(geom, ${point}) AS "distanceMeters"
       FROM facilities
       WHERE ST_DWithin(geom, ${point}, $3)
       ORDER BY ST_Distance(geom, ${point}) ASC
       LIMIT $4`,
      [q.lng, q.lat, q.radiusMeters, q.limit],
    );
    return rows.map((row) => ({
      ...mapFacility(row),
      distanceMeters: Math.round(Number(row.distanceMeters)),
    }));
  }

  /**
   * Resources within `radiusMeters` of the point, nearest first. Optionally
   * filter to a single agency type (EMS / Fire / Police).
   */
  async nearbyResources(
    q: NearbyQuery & { type?: ResourceType },
  ): Promise<NearbyResource[]> {
    const point = 'ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography';
    const params: unknown[] = [q.lng, q.lat, q.radiusMeters, q.limit];
    let typeFilter = '';
    if (q.type) {
      params.push(q.type);
      typeFilter = `AND type = $${params.length}`;
    }
    const { rows } = await this.db.query<ResourceRow>(
      `SELECT ${RESOURCE_COLUMNS},
              ST_Distance(geom, ${point}) AS "distanceMeters"
       FROM resources
       WHERE ST_DWithin(geom, ${point}, $3) ${typeFilter}
       ORDER BY ST_Distance(geom, ${point}) ASC
       LIMIT $4`,
      params,
    );
    return rows.map((row) => ({
      ...mapResource(row),
      distanceMeters: Math.round(Number(row.distanceMeters)),
    }));
  }
}
