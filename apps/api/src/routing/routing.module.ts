import { Module } from '@nestjs/common';
import { FacilitiesModule } from '../facilities/facilities.module';
import { ResourcesModule } from '../resources/resources.module';
import { RoutingController } from './routing.controller';
import { RoutingService } from './routing.service';
import { ReachabilityService } from './reachability.service';

@Module({
  imports: [FacilitiesModule, ResourcesModule],
  controllers: [RoutingController],
  providers: [RoutingService, ReachabilityService],
  exports: [RoutingService],
})
export class RoutingModule {}
