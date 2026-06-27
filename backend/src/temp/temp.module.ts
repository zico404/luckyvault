import { Module } from '@nestjs/common';
import { AdminFixController } from './admin-fix.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminFixController],
})
export class TempModule {}
