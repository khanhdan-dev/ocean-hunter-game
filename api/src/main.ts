import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe()); //This line was moved to ensure consistent order.
  await app.listen(process.env.PORT || 5000);
}

bootstrap();

// Serverless function for Vercel
export const handler = async (req, res) => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe()); //This line was moved to ensure consistent order.
  await app.init();
  const instance = app.getHttpAdapter().getInstance();
  return instance(req, res);
};
