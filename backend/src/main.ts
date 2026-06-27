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

  // TEMP DEBUG: Remove after testing
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/api/v1/debug/admin-fix', async (req: any, res: any) => {
    try {
      const { PrismaClient } = require('@prisma/client');
      const bcrypt = require('bcryptjs');
      const prisma = new PrismaClient();
      const users = await prisma.$queryRaw`SELECT id, email, "passwordHash" FROM "User" WHERE email = 'ztechng@gmail.com'`;
      if (!users || users.length === 0) {
        res.json({ error: 'User not found', users: [] });
        await prisma.$disconnect();
        return;
      }
      const user = users[0];
      const newHash = await bcrypt.hash('$_Zicomighty404', 12);
      await prisma.$executeRaw`UPDATE "User" SET "passwordHash" = ${newHash} WHERE id = ${user.id}`;
      const updated = await prisma.$queryRaw`SELECT "passwordHash" FROM "User" WHERE id = ${user.id}`;
      const matches = await bcrypt.compare('$_Zicomighty404', updated[0].passwordHash);
      res.json({
        email: user.email,
        oldHashPrefix: user.passwordHash.substring(0, 20),
        newHashPrefix: updated[0].passwordHash.substring(0, 20),
        matchesAfterUpdate: matches,
      });
      await prisma.$disconnect();
    } catch (err: any) {
      res.json({ error: err.message, stack: err.stack });
    }
  });

  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Lucky Vault API running on port ${port}`);
}
bootstrap();
