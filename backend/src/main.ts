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

  const isDev = configService.get('NODE_ENV') !== 'production';
  const corsOrigins = configService.get('CORS_ORIGINS', '');
  app.enableCors({
    origin: corsOrigins
      ? corsOrigins.split(',').map((s: string) => s.trim())
      : isDev
        ? true
        : true,
    credentials: true,
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
  logger.log(`Lucky Vault API running on port ${port} (${isDev ? 'development' : 'production'})`);
}
bootstrap();
