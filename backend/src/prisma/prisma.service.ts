import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private connected = false;

  async onModuleInit() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      this.logger.error('DATABASE_URL is not set — database features will be unavailable');
      return;
    }
    this.logger.log(`DATABASE_URL host: ${new URL(url).hostname}`);
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await this.$connect();
        this.connected = true;
        this.logger.log('Database connected');
        return;
      } catch (err: any) {
        this.logger.error(`Database connection attempt ${attempt}/5 failed: ${err.message}`);
        if (attempt < 5) {
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }
    this.logger.error('All database connection attempts failed');
  }

  isConnected(): boolean {
    return this.connected;
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {}
  }
}
