import { Module } from '@nestjs/common';
import { IncidentsModule } from '../incidents/incidents.module';
import { ResourcesModule } from '../resources/resources.module';
import { RoutingModule } from '../routing/routing.module';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';

@Module({
  imports: [IncidentsModule, ResourcesModule, RoutingModule],
  controllers: [DispatchController],
  providers: [DispatchService],
})
export class DispatchModule {}
