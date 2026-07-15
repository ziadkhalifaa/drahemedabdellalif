import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const [
      totalAppointments,
      pendingAppointments,
      approvedAppointments,
      completedAppointments,
      cancelledAppointments,
      totalPosts,
      publishedPosts,
      totalMessages,
      unreadMessages,
      totalTestimonials,
      approvedTestimonials,
      recentAppointments,
      recentEvents,
      visitorStats,
      appointmentsForCharts,
      paymobSum,
      manualOnlineCount,
      manualClinicCount,
    ] = await Promise.all([
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { status: 'pending' } }),
      this.prisma.appointment.count({ where: { status: 'approved' } }),
      this.prisma.appointment.count({ where: { status: 'completed' } }),
      this.prisma.appointment.count({ where: { status: 'cancelled' } }),
      this.prisma.blogPost.count(),
      this.prisma.blogPost.count({ where: { status: 'published' } }),
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.count({ where: { isRead: false } }),
      this.prisma.testimonial.count(),
      this.prisma.testimonial.count({ where: { isApproved: true } }),
      this.prisma.appointment.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 5,
        include: { patient: true }
      }),
      this.prisma.analyticsEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      this.prisma.$queryRaw`
        SELECT 
          TO_CHAR("createdAt", 'YYYY-MM-DD') as date,
          COUNT(*)::int as count
        FROM "AnalyticsEvent"
        WHERE type = 'page_view' AND "createdAt" >= ${thirtyDaysAgo}
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
        ORDER BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      ` as Promise<any[]>,
      this.prisma.appointment.findMany({
        where: {
          createdAt: {
            gte: new Date(today.getFullYear(), today.getMonth() - 5, 1, 0, 0, 0, 0)
          }
        },
        include: { payments: true }
      }),
      this.prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: 'SUCCESS' }
      }),
      this.prisma.appointment.count({
        where: {
          type: 'ONLINE',
          paymentStatus: 'CONFIRMED',
          NOT: { payments: { some: { status: 'SUCCESS' } } }
        }
      }),
      this.prisma.appointment.count({
        where: {
          type: 'IN_CLINIC',
          OR: [
            { paymentStatus: 'CONFIRMED' },
            { status: 'completed' }
          ],
          NOT: { payments: { some: { status: 'SUCCESS' } } }
        }
      })
    ]);

    // Grouping last 6 months of data
    const chartsData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(today.getMonth() - i);
      const mName = d.toLocaleString('en-US', { month: 'short' });
      const year = d.getFullYear();
      
      chartsData.push({
        month: mName,
        year,
        count: 0,
        clinicsBookings: 0,
        onlineBookings: 0,
        clinicsPayments: 0,
        onlinePayments: 0
      });
    }

    for (const apt of appointmentsForCharts) {
      const aptDate = new Date(apt.createdAt);
      const mName = aptDate.toLocaleString('en-US', { month: 'short' });
      const year = aptDate.getFullYear();
      
      const monthData = chartsData.find(c => c.month === mName && c.year === year);
      if (!monthData) continue;

      monthData.count += 1;
      const isOnline = apt.type === 'ONLINE';

      if (isOnline) {
        monthData.onlineBookings += 1;
      } else {
        monthData.clinicsBookings += 1;
      }

      let revenue = 0;
      const successfulPayment = apt.payments.find(p => p.status === 'SUCCESS');
      if (successfulPayment) {
        revenue = successfulPayment.amount;
      } else if (apt.paymentStatus === 'CONFIRMED') {
        revenue = isOnline ? 300 : 500;
      } else if (!isOnline && apt.status === 'completed') {
        revenue = 500;
      }

      if (isOnline) {
        monthData.onlinePayments += revenue;
      } else {
        monthData.clinicsPayments += revenue;
      }
    }

    const totalRevenue = (paymobSum._sum.amount || 0) + (manualOnlineCount * 300) + (manualClinicCount * 500);

    return {
      overview: {
        appointments: { total: totalAppointments, pending: pendingAppointments, approved: approvedAppointments, completed: completedAppointments, cancelled: cancelledAppointments },
        blog: { total: totalPosts, published: publishedPosts },
        messages: { total: totalMessages, unread: unreadMessages },
        testimonials: { total: totalTestimonials, approved: approvedTestimonials },
        totalRevenue,
      },
      recentAppointments,
      recentEvents,
      charts: {
        appointments: chartsData,
        visitors: visitorStats,
      }
    };
  }

  async getNotifications() {
    const [pendingAppointments, unreadMessages, pendingTestimonials] = await Promise.all([
      this.prisma.appointment.count({ where: { status: 'pending' } }),
      this.prisma.contactMessage.count({ where: { isRead: false } }),
      this.prisma.testimonial.count({ where: { isApproved: false } }),
    ]);

    return {
      pendingAppointments,
      unreadMessages,
      pendingTestimonials,
      total: pendingAppointments + unreadMessages + pendingTestimonials,
    };
  }

  async trackEvent(type: string, payload: Record<string, any>) {
    try {
      return await this.prisma.analyticsEvent.create({ data: { type, payload } });
    } catch (error) {
      console.error(`[AnalyticsService] Failed to track event ${type}:`, (error as Error).message);
      return null;
    }
  }
}
