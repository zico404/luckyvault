import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      this.logger.error('DATABASE_URL is not set — database features will be unavailable');
      return;
    }
    try {
      await this.$connect();
      this.logger.log('Database connected');
    } catch (err: any) {
      this.logger.error(`Database connection failed: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {}
  }
}
