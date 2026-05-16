import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { WhatsAppService } from '../../common/whatsapp.service';
import { RemindersController } from './reminders.controller';

@Module({
  providers: [RemindersService, WhatsAppService],
  controllers: [RemindersController],
  exports: [RemindersService],
})
export class RemindersModule {}
