import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check() {
    const checks: Record<string, string> = {};

    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      try {
        const url = new URL(dbUrl);
        checks.dbHost = url.hostname;
        checks.dbPort = url.port;
      } catch {
        checks.dbHost = 'invalid-url';
      }
    } else {
      checks.dbHost = 'not-set';
    }

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'connected';
    } catch (err: any) {
      checks.database = 'disconnected';
      checks.dbError = err.message?.substring(0, 200);
    }

    const isHealthy = checks.database === 'connected';

    return {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      ...checks,
    };
  }
}
