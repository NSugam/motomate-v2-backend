import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { env } from './config/env';
import { SuccessResponseInterceptor } from './interceptor/response.interceptor';

config();
const PORT = env.PORT;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new SuccessResponseInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Motomate-v2.0 APIs')
    .setDescription('API Documentation for  Motomate-v2.0.')
    .setExternalDoc('Postman Collection', '/docs-json')
    .setVersion('v2.0')
    .addCookieAuth('_xf_')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(PORT ?? 9095);
}

void bootstrap().then((): void => {
  console.log(`|--------Server is running on port ${PORT}--------|`);
});
