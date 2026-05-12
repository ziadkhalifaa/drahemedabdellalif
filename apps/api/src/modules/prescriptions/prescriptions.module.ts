import { Module } from '@nestjs/common';
import { PrescriptionsController } from './infrastructure/prescriptions.controller';
import { PrescriptionsService } from './application/prescriptions.service';
import { PrismaModule } from '../../common/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PrescriptionsController],
  providers: [PrescriptionsService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
