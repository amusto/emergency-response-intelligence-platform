import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { DispatchRecommendations } from '../common/domain';
import { DispatchService } from './dispatch.service';

@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Get('recommendations')
  recommendations(
    @Query('incidentId') incidentId: string,
    @Query('limit') limit?: string,
  ): Promise<DispatchRecommendations> {
    if (!incidentId) {
      throw new BadRequestException('incidentId is required');
    }
    const lim = limit !== undefined ? Number(limit) : 3;
    if (!Number.isInteger(lim) || lim <= 0 || lim > 20) {
      throw new BadRequestException('limit must be an integer between 1 and 20');
    }
    return this.dispatchService.recommend(incidentId, lim);
  }
}
