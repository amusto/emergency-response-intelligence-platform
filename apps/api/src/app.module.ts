import { Module } from '@nestjs/common';
import { FacilitiesModule } from './facilities/facilities.module';
import { ResourcesModule } from './resources/resources.module';
import { IncidentsModule } from './incidents/incidents.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [FacilitiesModule, ResourcesModule, IncidentsModule],
  controllers: [HealthController],
})
export class AppModule {}
