import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const url = process.env.DATABASE_URL || '';
    const needsPgbouncer = url.includes('pooler.supabase.com') && !url.includes('pgbouncer');
    super({
      datasourceUrl: needsPgbouncer ? `${url}${url.includes('?') ? '&' : '?'}pgbouncer=true` : undefined,
    });
  }

  async onModuleInit() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      this.logger.error('DATABASE_URL is not set');
      throw new Error('DATABASE_URL is not set');
    }
    this.logger.log(`Connecting to: ${new URL(url).hostname}`);
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Database connected');
        return;
      } catch (err: any) {
        this.logger.error(`Connection attempt ${attempt}/5 failed: ${err.message}`);
        if (attempt < 5) await new Promise((r) => setTimeout(r, 3000));
      }
    }
    throw new Error('Failed to connect to database after 5 attempts');
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (err: any) {
      this.logger.warn(`Error disconnecting: ${err.message}`);
    }
  }
}
