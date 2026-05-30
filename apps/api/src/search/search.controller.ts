import { Controller, Get, Query } from '@nestjs/common';
import { SearchResults } from '../common/domain';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query('q') q = ''): SearchResults {
    return this.searchService.search(q);
  }
}
