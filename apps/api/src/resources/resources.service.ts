import { Injectable, NotFoundException } from '@nestjs/common';
import { Resource } from '../common/domain';
import { RESOURCES } from '../seed/resources.seed';

@Injectable()
export class ResourcesService {
  private readonly resources: Resource[] = RESOURCES;

  findAll(): Resource[] {
    return this.resources;
  }

  findOne(id: string): Resource {
    const resource = this.resources.find((r) => r.id === id);
    if (!resource) {
      throw new NotFoundException(`Resource ${id} not found`);
    }
    return resource;
  }
}
