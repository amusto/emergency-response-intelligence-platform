import { Injectable, NotFoundException } from '@nestjs/common';
import { Facility } from '../common/domain';
import { FACILITIES } from '../seed/facilities.seed';

@Injectable()
export class FacilitiesService {
  private readonly facilities: Facility[] = FACILITIES;

  findAll(): Facility[] {
    return this.facilities;
  }

  findOne(id: string): Facility {
    const facility = this.facilities.find((f) => f.id === id);
    if (!facility) {
      throw new NotFoundException(`Facility ${id} not found`);
    }
    return facility;
  }
}
