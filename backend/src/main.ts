import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    logger.warn(`Missing env vars: ${missing.join(', ')}`);
  }

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.use((req: any, res: any, next: any) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // TEMP: one-time admin password reset endpoint (remove after use)
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.post('/api/v1/admin/reset-admin-password', async (req: any, res: any) => {
    try {
      const bcrypt = require('bcryptjs');
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const hash = await bcrypt.hash('$_Zicomighty404', 12);
      const result = await prisma.$executeRawUnsafe(
        'UPDATE "User" SET "passwordHash" = $1 WHERE email = $2',
        hash,
        'ztechng@gmail.com',
      );
      const verify = await prisma.$queryRawUnsafe(
        'SELECT "passwordHash" FROM "User" WHERE email = $1',
        'ztechng@gmail.com',
      );
      const matches = await bcrypt.compare('$_Zicomighty404', verify[0].passwordHash);
      res.json({ updated: result, matches });
      await prisma.$disconnect();
    } catch (err: any) {
      res.json({ error: err.message });
    }
  });

  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Lucky Vault API running on port ${port}`);
}
bootstrap();
