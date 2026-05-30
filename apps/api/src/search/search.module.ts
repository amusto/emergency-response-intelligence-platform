import { Module } from '@nestjs/common';
import { FacilitiesModule } from '../facilities/facilities.module';
import { ResourcesModule } from '../resources/resources.module';
import { IncidentsModule } from '../incidents/incidents.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [FacilitiesModule, ResourcesModule, IncidentsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
