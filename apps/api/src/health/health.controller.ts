import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check(): { status: string; phase: string; timestamp: string } {
    return {
      status: 'ok',
      phase: 'Phase 5 — Resource Allocation',
      timestamp: new Date().toISOString(),
    };
  }
}
