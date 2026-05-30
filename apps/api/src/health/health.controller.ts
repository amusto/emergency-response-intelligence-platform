import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check(): { status: string; phase: string; timestamp: string } {
    return {
      status: 'ok',
      phase: 'Phase 1 — Operational Map MVP',
      timestamp: new Date().toISOString(),
    };
  }
}
