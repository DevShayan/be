import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.enableCors({
  //   origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  //   credentials: true,
  // });

  app.useGlobalPipes(
    new ValidationPipe(),
  );
  app.enableCors();

  app.setGlobalPrefix('v1', { exclude: [''] });

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log("Listening on port 3000");
  });
}
bootstrap();
