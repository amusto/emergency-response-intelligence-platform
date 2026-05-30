import { Injectable, NotFoundException } from '@nestjs/common';
import { Incident } from '../common/domain';
import { INCIDENTS } from '../seed/incidents.seed';

@Injectable()
export class IncidentsService {
  private readonly incidents: Incident[] = INCIDENTS;

  findAll(): Incident[] {
    return this.incidents;
  }

  findOne(id: string): Incident {
    const incident = this.incidents.find((i) => i.id === id);
    if (!incident) {
      throw new NotFoundException(`Incident ${id} not found`);
    }
    return incident;
  }
}
