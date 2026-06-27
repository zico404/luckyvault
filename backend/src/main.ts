import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  const isDev = configService.get('NODE_ENV') !== 'production';
  const corsOrigins = configService.get('CORS_ORIGINS', '');
  app.enableCors({
    origin: isDev
      ? true
      : corsOrigins
        ? corsOrigins.split(',').map((s: string) => s.trim())
        : [/\.luckyvault\.app$/],
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
