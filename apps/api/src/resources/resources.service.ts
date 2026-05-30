import { Injectable, NotFoundException } from '@nestjs/common';
import { Resource } from '../common/domain';
import { DatabaseService } from '../database/database.service';
import { RESOURCE_COLUMNS, ResourceRow, mapResource } from '../common/sql';

@Injectable()
export class ResourcesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<Resource[]> {
    const { rows } = await this.db.query<ResourceRow>(
      `SELECT ${RESOURCE_COLUMNS} FROM resources ORDER BY unit_number`,
    );
    return rows.map(mapResource);
  }

  async findOne(id: string): Promise<Resource> {
    const { rows } = await this.db.query<ResourceRow>(
      `SELECT ${RESOURCE_COLUMNS} FROM resources WHERE id = $1`,
      [id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Resource ${id} not found`);
    }
    return mapResource(rows[0]);
  }
}
