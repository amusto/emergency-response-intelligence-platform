import { Injectable, NotFoundException } from '@nestjs/common';
import { Incident } from '../common/domain';
import { DatabaseService } from '../database/database.service';
import { INCIDENT_COLUMNS, IncidentRow, mapIncident } from '../common/sql';

@Injectable()
export class IncidentsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<Incident[]> {
    const { rows } = await this.db.query<IncidentRow>(
      `SELECT ${INCIDENT_COLUMNS} FROM incidents ORDER BY reported_at DESC`,
    );
    return rows.map(mapIncident);
  }

  async findOne(id: string): Promise<Incident> {
    const { rows } = await this.db.query<IncidentRow>(
      `SELECT ${INCIDENT_COLUMNS} FROM incidents WHERE id = $1`,
      [id],
    );
    if (rows.length === 0) {
      throw new NotFoundException(`Incident ${id} not found`);
    }
    return mapIncident(rows[0]);
  }
}
