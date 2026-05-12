import { Module } from '@nestjs/common';
import { AnalyticsController } from './infrastructure/analytics.controller';
import { AnalyticsService } from './application/analytics.service';
import { ExportService } from '../../common/export.service';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, ExportService],
})
export class AnalyticsModule {}
