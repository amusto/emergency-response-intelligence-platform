import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API prefix keeps the contract stable as modules grow.
  app.setGlobalPrefix('api');

  // Allow the Vite dev server / web container to call the API.
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
  });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`ERIP API listening on http://localhost:${port}/api`);
}

bootstrap();
