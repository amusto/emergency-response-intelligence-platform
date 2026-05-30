import { Controller, Get, Param } from '@nestjs/common';
import { Resource } from '../common/domain';
import { ResourcesService } from './resources.service';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  findAll(): Resource[] {
    return this.resourcesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Resource {
    return this.resourcesService.findOne(id);
  }
}
