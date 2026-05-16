import { Module } from '@nestjs/common';
import { AppointmentsController } from './infrastructure/appointments.controller';
import { AppointmentsService } from './application/appointments.service';
import { AppointmentReminderService } from './application/appointment-reminder.service';
import { EmailService } from '../../common/email.service';
import { WhatsAppService } from '../../common/whatsapp.service';
import { StorageService } from '../media/application/storage.service';
import { ClinicsModule } from '../clinics/clinics.module';

@Module({
  imports: [ClinicsModule],
  controllers: [AppointmentsController],
  providers: [
    AppointmentsService,
    EmailService,
    WhatsAppService,
    AppointmentReminderService,
    StorageService,
  ],
})
export class AppointmentsModule {}

