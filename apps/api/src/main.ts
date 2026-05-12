import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as fs from 'fs';
import { join, resolve } from 'path';


import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/logger/winston.config';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

let app: NestExpressApplication;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: WinstonModule.createLogger(winstonConfig),
    });

    // Security & Middleware
    app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginEmbedderPolicy: false,
    }));
    
    app.setGlobalPrefix('api', {
      exclude: ['uploads/(.*)'],
    });

    app.use(cookieParser());

    app.enableCors({
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'https://drahmedabdellatif.com',
        'http://gold-buffalo-912779.hostingersite.com',
        'https://gold-buffalo-912779.hostingersite.com',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new GlobalExceptionFilter());

    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Dr. Ahmed Abdellatif API')
        .setDescription('API for Dr. Ahmed Abdellatif Medical Platform')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
    }

    await app.init();
  }
  return app.getHttpAdapter().getInstance();
}

// تصدير الدالة لفارسيل
export default async (req: any, res: any) => {
  const instance = await bootstrap();
  instance(req, res);
};

