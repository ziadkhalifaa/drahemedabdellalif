import { Controller, Get, Post, Body, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AnalyticsService } from '../application/analytics.service';
import { ExportService } from '../../../common/export.service';
import { PrismaService } from '../../../common/prisma.service';
import { RolesGuard, Roles } from '../../../common/decorators';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly exportService: ExportService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('dashboard')
  async getDashboard() {
    return this.analyticsService.getDashboardStats();
  }

  @Post('track')
  async track(@Body() body: { type: string; payload: Record<string, any> }) {
    return this.analyticsService.trackEvent(body.type, body.payload);
  }

  @Get('notifications')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  async getNotifications() {
    return this.analyticsService.getNotifications();
  }

  @Get('export/appointments')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async exportAppointments(@Res() res: Response) {
    const data = await this.prisma.appointment.findMany({
      include: { patient: true },
      orderBy: { date: 'desc' },
    });

    const formattedData = data.map((a) => ({
      ID: a.id,
      Patient: a.patient?.name || a.guestName || 'N/A',
      Email: a.patient?.email || a.guestEmail || 'N/A',
      Phone: a.patient?.phone || a.guestPhone || 'N/A',
      Date: a.date.toLocaleDateString(),
      Time: a.timeSlot,
      Type: a.type,
      Status: a.status,
    }));

    const columns = [
      { header: 'ID', key: 'ID', width: 20 },
      { header: 'Patient Name', key: 'Patient', width: 25 },
      { header: 'Email', key: 'Email', width: 25 },
      { header: 'Phone', key: 'Phone', width: 15 },
      { header: 'Date', key: 'Date', width: 15 },
      { header: 'Time', key: 'Time', width: 10 },
      { header: 'Type', key: 'Type', width: 10 },
      { header: 'Status', key: 'Status', width: 10 },
    ];

    return this.exportService.exportToExcel(res, formattedData, columns, 'appointments_report');
  }

  @Get('export/newsletter')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  async exportNewsletter(@Res() res: Response) {
    const data = await this.prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formattedData = data.map((s) => ({
      Email: s.email,
      Name: s.name || 'N/A',
      Status: s.isActive ? 'Active' : 'Inactive',
      Joined: s.createdAt.toLocaleDateString(),
    }));

    const columns = [
      { header: 'Email', key: 'Email', width: 35 },
      { header: 'Name', key: 'Name', width: 25 },
      { header: 'Status', key: 'Status', width: 15 },
      { header: 'Joined At', key: 'Joined', width: 20 },
    ];

    return this.exportService.exportToExcel(res, formattedData, columns, 'newsletter_subscribers');
  }
}
