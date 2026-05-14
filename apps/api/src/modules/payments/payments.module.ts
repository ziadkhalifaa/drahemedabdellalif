import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './application/payments.service';
import { PaymobService } from '../../common/paymob.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymobService, PrismaService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
