import { Controller, Get, Param } from '@nestjs/common';
import { Incident } from '../common/domain';
import { IncidentsService } from './incidents.service';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  findAll(): Incident[] {
    return this.incidentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Incident {
    return this.incidentsService.findOne(id);
  }
}
