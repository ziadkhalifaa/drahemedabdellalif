import {
  Controller, Get, Post, Patch, Param, Body,
  UseGuards, Req, Query, ForbiddenException,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from '../application/appointments.service';
import { AppointmentReminderService } from '../application/appointment-reminder.service';
import { RolesGuard, Roles } from '../../../common/decorators';
import { AppointmentStatus, AppointmentType } from '@dr-ahmed/shared';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly reminderService: AppointmentReminderService
  ) { }

  @Post('trigger-reminders')
  async triggerReminders(@Req() req: any) {
    const secret = req.headers['x-cron-secret'];
    const authHeader = req.headers['authorization'];
    // Accept either the custom secret OR the Vercel OIDC token
    if (secret !== process.env.CRON_SECRET && (!authHeader || !authHeader.startsWith('Bearer '))) {
      throw new ForbiddenException('Invalid cron secret');
    }
    return this.reminderService.sendReminders();
  }

  @Post()
  async create(@Body() body: {
    patientId?: string;
    guestName?: string;
    guestPhone?: string;
    guestEmail?: string;
    type: AppointmentType;
    date: string;
    timeSlot: string;
    notes?: string;
    paymentMethod?: string;
    paymentSenderNum?: string;
    paymentProofUrl?: string;
    depositAmount?: number;
  }) {
    return this.appointmentsService.create(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('status') status?: string,
  ) {
    return this.appointmentsService.findAll(+page, +limit, { paymentStatus, status });
  }

  @Get('available-slots')
  async getAvailableSlots(@Query('date') date: string) {
    return this.appointmentsService.getAvailableSlots(date);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Get('stats')
  async getStats() {
    return this.appointmentsService.getStats();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('by-meeting/:meetingId')
  async findByMeetingId(@Param('meetingId') meetingId: string) {
    return this.appointmentsService.findByMeetingId(meetingId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('my')
  async findMy(@Req() req: any) {
    return this.appointmentsService.findByPatientId(req.user.id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: AppointmentStatus; cancellationReason?: string },
  ) {
    return this.appointmentsService.updateStatus(id, body.status, body.cancellationReason);
  }

  @Post(':id/payment-proof')
  @UseInterceptors(FileInterceptor('proof'))
  async uploadProof(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('senderPhone') senderPhone: string,
  ) {
    return this.appointmentsService.uploadPaymentProof(id, file, senderPhone);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Patch(':id/confirm-payment')
  async confirmPayment(
    @Param('id') id: string,
    @Body() body: { action: 'confirm' | 'reject'; adminNote?: string },
  ) {
    return this.appointmentsService.confirmPayment(id, body.action, body.adminNote);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Get('pending-payments')
  async getPendingPayments() {
    return this.appointmentsService.getPendingPayments();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string, @Req() req: any) {
    return this.appointmentsService.updateStatus(id, AppointmentStatus.CANCELLED);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/review')
  async createReview(
    @Param('id') id: string,
    @Body() body: { rating: number; comment?: string },
    @Req() req: any
  ) {
    return this.appointmentsService.createReview(id, req.user.id, body.rating, body.comment);
  }
}
