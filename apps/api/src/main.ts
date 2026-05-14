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

let cachedApp: NestExpressApplication;

async function bootstrap() {
  if (!cachedApp) {
    cachedApp = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: WinstonModule.createLogger(winstonConfig),
      bufferLogs: true,
    });

    // Security & Middleware
    cachedApp.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      crossOriginEmbedderPolicy: false,
    }));
    
    cachedApp.setGlobalPrefix('api', {
      exclude: ['uploads/(.*)'],
    });

    cachedApp.use(cookieParser());

    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
      .split(',')
      .map(o => o.trim());

    cachedApp.enableCors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // Allow server-to-server
        const allowed = allowedOrigins.some(o => 
          origin === o || origin.endsWith(`.${new URL(o).hostname}`)
        );
        allowed ? cb(null, true) : cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-cron-secret'],
    });

    cachedApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    cachedApp.useGlobalFilters(new GlobalExceptionFilter());

    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Dr. Ahmed Abdellatif API')
        .setDescription('API for Dr. Ahmed Abdellatif Medical Platform')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(cachedApp, config);
      SwaggerModule.setup('api/docs', cachedApp, document);
    }

    await cachedApp.init();
  }
  return cachedApp.getHttpAdapter().getInstance();
}

export default async (req: any, res: any) => {
  try {
    const app = await bootstrap();
    app(req, res);
  } catch (error) {
    console.error('Error during Vercel execution', error);
    res.status(500).json({ message: 'Internal server error during initialization' });
  }
};
