import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { BlogModule } from './modules/blog/blog.module';
import { ServicesModule } from './modules/services/services.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { ContactModule } from './modules/contact/contact.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { MediaModule } from './modules/media/media.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ReportsModule } from './modules/reports/reports.module';
import { NewsletterModule } from './modules/newsletter/newsletter.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { WorkingHoursModule } from './modules/working-hours/working-hours.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        setHeaders: (res) => {
          res.set('Access-Control-Allow-Origin', '*');
          res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        },
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),

    PrismaModule,
    AuthModule,
    AppointmentsModule,
    BlogModule,
    ServicesModule,
    TestimonialsModule,
    ContactModule,
    AnalyticsModule,
    MediaModule,
    SettingsModule,
    ReportsModule,
    WorkingHoursModule,
    NewsletterModule,
    PrescriptionsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
