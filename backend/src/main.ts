import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    logger.warn(`Missing env vars: ${missing.join(', ')}`);
  }

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  const corsOrigins = configService.get('CORS_ORIGINS', '');
  const allowedOrigins = corsOrigins
    ? corsOrigins.split(',').map((s: string) => s.trim())
    : [];

  app.use((req: any, res: any, next: any) => {
    const origin = req.headers.origin;
    if (!origin) return next();

    const isAllowed = allowedOrigins.length === 0 || allowedOrigins.includes(origin);

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept');

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

  app.enableShutdownHooks();

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  logger.log(`Lucky Vault API running on port ${port}`);
}
bootstrap();
