import { Module } from '@nestjs/common';
import { WorkingHoursService } from './application/working-hours.service';
import { WorkingHoursController } from './infrastructure/working-hours.controller';

@Module({
  providers: [WorkingHoursService],
  controllers: [WorkingHoursController],
  exports: [WorkingHoursService],
})
export class WorkingHoursModule {}
