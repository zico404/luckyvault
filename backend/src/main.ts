import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  const isDev = process.env.NODE_ENV !== 'production';
  app.enableCors({
    origin: isDev ? true : ['https://luckyvault.app', /\.luckyvault\.app$/],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Lucky Vault API running on port ${port} (${isDev ? 'development' : 'production'})`);
}
bootstrap();
