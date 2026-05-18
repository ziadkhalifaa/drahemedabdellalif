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

let bootstrapPromise: Promise<any> | null = null;

async function bootstrap() {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      console.log('[BOOTSTRAP-DEBUG] Creating NestJS application (NestFactory.create)...');
      const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        bufferLogs: false,
      });
      console.log('[BOOTSTRAP-DEBUG] NestJS application created successfully.');

      // Trust reverse proxy (e.g. Hostinger, Cloudflare) headers to parse actual client IP for ThrottlerGuard
      app.set('trust proxy', 1);

      // Security & Middleware
      app.use(helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: false,
      }));
      
      app.setGlobalPrefix('api', {
        exclude: ['uploads/(.*)'],
      });

      app.use(cookieParser());

      const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,https://drahmedabdellatif.com')
        .split(',')
        .map(o => o.trim());

      app.enableCors({
        origin: (origin, cb) => {
          if (!origin) return cb(null, true);
          const allowed = allowedOrigins.some(o => {
            if (o === '*' || origin === o) return true;
            try {
              return origin.endsWith(`.${new URL(o).hostname}`);
            } catch (e) {
              return false;
            }
          });
          allowed ? cb(null, true) : cb(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-cron-secret'],
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

      console.log('[BOOTSTRAP-DEBUG] Initializing NestJS application (app.init)...');
      await app.init();
      console.log('[BOOTSTRAP-DEBUG] NestJS application initialized successfully.');

      if (!process.env.VERCEL) {
        const port = process.env.PORT || 4000;
        console.log(`[BOOTSTRAP-DEBUG] Calling app.listen(${port})...`);
        await app.listen(port);
        console.log(`[BOOTSTRAP-DEBUG] app.listen(${port}) successful!`);
        Logger.log(`🚀 API Server listening on port ${port}`, 'Bootstrap');
      }

      return app.getHttpAdapter().getInstance();
    })();
  }
  return bootstrapPromise;
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

// For standalone Node.js environments (like Hostinger, PM2, local)
if (!process.env.VERCEL) {
  console.log('[BOOTSTRAP-DEBUG] Standalone environment detected, invoking bootstrap()...');
  bootstrap()
    .then(() => {
      console.log('[BOOTSTRAP-DEBUG] bootstrap() Promise resolved successfully!');
    })
    .catch(err => {
      console.error('[BOOTSTRAP-DEBUG] bootstrap() Promise REJECTED with error:', err);
      process.exit(1);
    });
}


