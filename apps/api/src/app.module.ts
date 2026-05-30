import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { ResourcesModule } from './resources/resources.module';
import { IncidentsModule } from './incidents/incidents.module';
import { SearchModule } from './search/search.module';
import { GeoModule } from './geo/geo.module';
import { RoutingModule } from './routing/routing.module';
import { DispatchModule } from './dispatch/dispatch.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    DatabaseModule,
    FacilitiesModule,
    ResourcesModule,
    IncidentsModule,
    SearchModule,
    GeoModule,
    RoutingModule,
    DispatchModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
