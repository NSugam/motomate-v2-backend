import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import serverlessExpress from '@vendia/serverless-express';
import express from 'express';

let cachedServer;

async function bootstrap() {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, expressApp);
  await app.init();
  return serverlessExpress({ app: expressApp });
}

export default async function handler(req, res) {
  if (!cachedServer) {
    cachedServer = await bootstrap();
  }
  return cachedServer(req, res);
}
