import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../common/prisma.service';
import { EmailService } from '../../../common/email.service';
import { WhatsAppService } from '../../../common/whatsapp.service';
import { AppointmentStatus } from '@dr-ahmed/shared';

@Injectable()
export class AppointmentReminderService {
  private readonly logger = new Logger(AppointmentReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendReminders() {
    this.logger.log('Running appointment reminders cron job...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

    const appointments = await this.prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfTomorrow,
          lt: endOfTomorrow,
        },
        status: AppointmentStatus.APPROVED,
      },
      include: { patient: true }
    });

    this.logger.log(`Found ${appointments.length} appointments for tomorrow.`);

    for (const apt of appointments) {
      const email = apt.guestEmail || apt.patient?.email;
      const phone = apt.guestPhone || apt.patient?.phone;
      const name = apt.guestName || apt.patient?.name || 'مريضنا العزيز';
      
      const formattedDate = new Date(apt.date).toLocaleDateString('ar-EG', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });

      if (email) {
        try {
          await this.emailService.sendAppointmentStatus(
            email,
            name,
            formattedDate,
            apt.timeSlot,
            'approved', // Reuse the status template as a reminder
            apt.meetingUrl || undefined
          );
        } catch (error: any) {
          this.logger.error(`Failed to send email reminder to ${email}: ${error.message}`);
        }
      }

      if (phone) {
        try {
          await this.whatsappService.sendReminder(phone, name, formattedDate, apt.timeSlot);
        } catch (error: any) {
          this.logger.error(`Failed to send WhatsApp reminder to ${phone}: ${error.message}`);
        }
      }
    }
  }
}
