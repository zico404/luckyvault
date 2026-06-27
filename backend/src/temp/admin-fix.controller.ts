import { Controller, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Controller('temp')
export class AdminFixController {
  constructor(private prisma: PrismaService) {}

  @Post('reset-admin-password')
  async resetAdminPassword() {
    const hash = await bcrypt.hash('$_Zicomighty404', 12);
    await this.prisma.$executeRawUnsafe(
      'UPDATE "User" SET "passwordHash" = $1 WHERE email = $2',
      hash,
      'ztechng@gmail.com',
    );
    const verify = await this.prisma.$queryRawUnsafe(
      'SELECT "passwordHash" FROM "User" WHERE email = $1',
      'ztechng@gmail.com',
    );
    const matches = await bcrypt.compare('$_Zicomighty404', (verify as any[])[0].passwordHash);
    return { updated: true, matches };
  }
}
