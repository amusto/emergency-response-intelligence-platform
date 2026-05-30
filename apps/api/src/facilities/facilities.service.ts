import { Injectable, NotFoundException } from '@nestjs/common';
import { Facility } from '../common/domain';
import { DatabaseService } from '../database/database.service';
import { FACILITY_COLUMNS, FacilityRow, mapFacility } from '../common/sql';

@Injectable()
export class FacilitiesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<Facility[]> {
    const { rows } = await this.db.query<FacilityRow>(
      `SELECT ${FACILITY_COLUMNS} FROM facilities ORDER BY name`,
    );
    return rows.map(mapFacility);
  }

  async findOne(id: string): Promise<Facility> {
    const { rows } = await this.db.query<FacilityRow>(
      `SELECT ${FACILITY_COLUMNS} FROM facilities WHERE id = $1`,
      [id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Facility ${id} not found`);
    }
    return mapFacility(rows[0]);
  }
}
