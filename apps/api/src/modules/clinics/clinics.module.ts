import { Module } from '@nestjs/common';
import { ClinicsService } from './application/clinics.service';
import { ClinicsController } from './infrastructure/clinics.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [ClinicsController],
  providers: [ClinicsService, PrismaService],
  exports: [ClinicsService],
})
export class ClinicsModule {}
