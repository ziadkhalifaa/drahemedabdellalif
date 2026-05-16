import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma.service';
import { WhatsAppService } from '../../common/whatsapp.service';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM) // Send daily at 10 AM
  async handleDailyReminders() {
    this.logger.log('Running daily appointment reminders cron job...');
    
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    // Find appointments for tomorrow that are approved
    const appointments = await this.prisma.appointment.findMany({
      where: {
        date: {
          gte: tomorrow,
          lte: endOfTomorrow,
        },
        status: 'approved',
      },
      include: {
        patient: true,
      },
    });

    this.logger.log(`Found ${appointments.length} appointments for tomorrow.`);

    for (const apt of appointments) {
      const phone = apt.patient?.phone || apt.guestPhone;
      const name = apt.patient?.name || apt.guestName;
      
      if (phone && name) {
        try {
          const dateStr = tomorrow.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          await this.whatsappService.sendReminder(phone, name, dateStr, apt.timeSlot);
          this.logger.log(`Reminder sent to ${name} (${phone})`);
        } catch (error: any) {
          this.logger.error(`Failed to send reminder to ${name}: ${error.message}`);
        }
      }
    }
  }

  // Manual trigger for testing
  async triggerRemindersForDate(dateStr: string) {
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    const endOfDate = new Date(targetDate);
    endOfDate.setHours(23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        date: { gte: targetDate, lte: endOfDate },
        status: 'approved',
      },
      include: { patient: true },
    });

    for (const apt of appointments) {
      const phone = apt.patient?.phone || apt.guestPhone;
      const name = apt.patient?.name || apt.guestName;
      if (phone && name) {
        const dStr = targetDate.toLocaleDateString('ar-EG');
        await this.whatsappService.sendReminder(phone, name, dStr, apt.timeSlot);
      }
    }

    return { sent: appointments.length };
  }
}
