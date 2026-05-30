import { Controller, Get, Param } from '@nestjs/common';
import { Facility } from '../common/domain';
import { FacilitiesService } from './facilities.service';

@Controller('facilities')
export class FacilitiesController {
  constructor(private readonly facilitiesService: FacilitiesService) {}

  @Get()
  findAll(): Facility[] {
    return this.facilitiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Facility {
    return this.facilitiesService.findOne(id);
  }
}
