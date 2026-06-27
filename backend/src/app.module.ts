import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { TicketsModule } from './tickets/tickets.module';
import { DrawsModule } from './draws/draws.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { RedisModule } from './common/redis.module';
import { HealthModule } from './health/health.module';
import { DownloadModule } from './download/download.module';
import { TempModule } from './temp/temp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    RedisModule,
    HealthModule,
    DownloadModule,
    TempModule,
    AuthModule,
    UsersModule,
    WalletModule,
    TicketsModule,
    DrawsModule,
    AdminModule,
    NotificationsModule,
    AuditModule,
  ],
})
export class AppModule {}
