import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  // app.enableCors();
  const port = process.env.PORT || 5000;
  await app.listen(port);
}
bootstrap();

// Export the Express app for Vercel
export const handler = async (req, res) => {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
};
