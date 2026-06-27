import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { DrawsModule } from '../draws/draws.module';
import { UsersModule } from '../users/users.module';
import { WalletModule } from '../wallet/wallet.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DrawsModule, UsersModule, WalletModule, AuditModule, NotificationsModule],
  controllers: [AdminController],
})
export class AdminModule {}
