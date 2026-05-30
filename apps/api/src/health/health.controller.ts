import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check(): { status: string; phase: string; timestamp: string } {
    return {
      status: 'ok',
      phase: 'Phase 3 — PostGIS Geospatial Search',
      timestamp: new Date().toISOString(),
    };
  }
}
