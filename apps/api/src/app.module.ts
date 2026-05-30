import { Module } from '@nestjs/common';
import { FacilitiesModule } from './facilities/facilities.module';
import { ResourcesModule } from './resources/resources.module';
import { IncidentsModule } from './incidents/incidents.module';
import { SearchModule } from './search/search.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [FacilitiesModule, ResourcesModule, IncidentsModule, SearchModule],
  controllers: [HealthController],
})
export class AppModule {}
