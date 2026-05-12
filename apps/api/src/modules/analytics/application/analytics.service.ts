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
      totalPosts,
      publishedPosts,
      totalMessages,
      unreadMessages,
      totalTestimonials,
      approvedTestimonials,
      recentAppointments,
      recentEvents,
      appointmentsByMonth,
      visitorStats
    ] = await Promise.all([
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { status: 'pending' } }),
      this.prisma.blogPost.count(),
      this.prisma.blogPost.count({ where: { status: 'published' } }),
      this.prisma.contactMessage.count(),
      this.prisma.contactMessage.count({ where: { isRead: false } }),
      this.prisma.testimonial.count(),
      this.prisma.testimonial.count({ where: { isApproved: true } }),
      this.prisma.appointment.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      this.prisma.analyticsEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      this.prisma.$queryRaw`
        SELECT 
          TO_CHAR("createdAt", 'Mon') as month,
          COUNT(*)::int as count
        FROM "Appointment"
        WHERE "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY TO_CHAR("createdAt", 'Mon'), DATE_TRUNC('month', "createdAt")
        ORDER BY DATE_TRUNC('month', "createdAt")
      `,
      this.prisma.$queryRaw`
        SELECT 
          TO_CHAR("createdAt", 'YYYY-MM-DD') as date,
          COUNT(*)::int as count
        FROM "AnalyticsEvent"
        WHERE type = 'page_view' AND "createdAt" >= ${thirtyDaysAgo}
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
        ORDER BY TO_CHAR("createdAt", 'YYYY-MM-DD')
      `
    ]);
    
    // Simple revenue calculation logic
    const completedAppointments = await this.prisma.appointment.findMany({
      where: { status: 'completed' },
      select: { type: true }
    });

    const totalRevenue = completedAppointments.reduce((acc, apt) => {
      return acc + (apt.type === 'ONLINE' ? 300 : 500);
    }, 0);

    return {
      overview: {
        appointments: { total: totalAppointments, pending: pendingAppointments },
        blog: { total: totalPosts, published: publishedPosts },
        messages: { total: totalMessages, unread: unreadMessages },
        testimonials: { total: totalTestimonials, approved: approvedTestimonials },
        totalRevenue,
      },
      recentAppointments,
      recentEvents,
      charts: {
        appointments: appointmentsByMonth,
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
    return this.prisma.analyticsEvent.create({ data: { type, payload } });
  }
}
