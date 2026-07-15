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

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCleanupExpiredTokens() {
    this.logger.log('Running cleanup job for expired tokens and old analytics...');
    
    const deletedTokens = await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    this.logger.log(`Deleted ${deletedTokens.count} expired refresh tokens`);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const deletedAnalytics = await this.prisma.analyticsEvent.deleteMany({
      where: { createdAt: { lt: ninetyDaysAgo } },
    });
    this.logger.log(`Deleted ${deletedAnalytics.count} analytics events older than 90 days`);
  }

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

  @Cron('*/5 * * * *') // Run every 5 minutes
  async handleSessionReminders() {
    this.logger.log('Running 10-minute session reminders cron job...');
    const now = new Date();

    // Fetch approved online appointments for today
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        type: 'ONLINE',
        status: 'approved',
        whatsappReminderSent: false,
        date: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      include: {
        patient: true,
      },
    });

    this.logger.log(`Found ${appointments.length} approved online appointments today to check for session reminders.`);

    for (const apt of appointments) {
      if (!apt.timeSlot) continue;
      
      const [hourStr, minuteStr] = apt.timeSlot.split(':');
      const hours = parseInt(hourStr || '0', 10);
      const minutes = parseInt(minuteStr || '0', 10);
      
      // Calculate local appointment start time
      const appointmentStart = new Date(
        apt.date.getFullYear(),
        apt.date.getMonth(),
        apt.date.getDate(),
        hours,
        minutes,
        0, 0
      );

      const diffMs = appointmentStart.getTime() - now.getTime();
      const diffMins = diffMs / (60 * 1000);

      // If the session starts in 5 to 15 minutes
      if (diffMins >= 5 && diffMins <= 15) {
        const phone = apt.patient?.phone || apt.guestPhone;
        const name = apt.patient?.name || apt.guestName || 'مريضنا العزيز';
        
        if (phone) {
          try {
            const frontendUrl = process.env.FRONTEND_URL || 'https://drahmedabdellatif.com';
            const roomUrl = `${frontendUrl}/ar/dashboard/video/${apt.meetingId || apt.id}`;
            
            const message = `تذكير: تبدأ جلستك الاستشارية مع د. أحمد عبد اللطيف بعد 10 دقائق.\nالموعد: اليوم الساعة ${apt.timeSlot}\nرابط الدخول المباشر للغرفة:\n${roomUrl}`;
            
            await this.whatsappService.sendMessage(phone, message);
            
            // Mark as sent
            await this.prisma.appointment.update({
              where: { id: apt.id },
              data: { whatsappReminderSent: true },
            });
            
            this.logger.log(`Session start reminder sent to ${name} (${phone}) for appointment ${apt.id}`);
          } catch (error: any) {
            this.logger.error(`Failed to send session reminder to ${name}: ${error.message}`);
          }
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
