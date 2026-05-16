import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { WhatsAppService } from '../../../common/whatsapp.service';
import { EmailService } from '../../../common/email.service';
import { StorageService } from '../../media/application/storage.service';
import { ClinicsService } from '../../clinics/application/clinics.service';
import { AppointmentStatus, AppointmentType } from '@dr-ahmed/shared';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly whatsappService: WhatsAppService,
    private readonly storageService: StorageService,
    private readonly clinicsService: ClinicsService,
  ) {}

  async create(data: {
    patientId?: string;
    guestName?: string;
    guestPhone?: string;
    guestEmail?: string;
    type: AppointmentType;
    date: string;
    timeSlot: string;
    notes?: string;
    clinicId?: string;
    paymentMethod?: string;
    paymentSenderNum?: string;
    paymentProofUrl?: string;
  }) {
    const appointmentDate = new Date(data.date);

    // التحقق من توفر الوقت في العيادة المختارة
    if (data.clinicId) {
      const availableSlots = await this.clinicsService.getAvailableSlots(
        data.clinicId,
        data.date,
      );
      if (!availableSlots.includes(data.timeSlot)) {
        throw new ConflictException('هذا الوقت غير متاح في العيادة المختارة');
      }
    } else {
      // فحص global (للأونلاين أو بدون عيادة)
      const existing = await this.prisma.appointment.findFirst({
        where: {
          date: appointmentDate,
          timeSlot: data.timeSlot,
          status: { notIn: [AppointmentStatus.REJECTED, AppointmentStatus.CANCELLED] },
        },
      });
      if (existing) throw new ConflictException('This time slot is already booked');
    }

    // تحديد حالة الدفع
    const paymentStatus = data.paymentMethod && data.paymentMethod !== 'NONE' && data.paymentMethod !== 'CASH'
      ? (data.paymentProofUrl ? 'PENDING_REVIEW' : 'PENDING_REVIEW')
      : 'NOT_REQUIRED';

    // If ONLINE, generate a professional Daily.co meeting link
    let meetingId = null;
    let meetingUrl = null;
    if (data.type === AppointmentType.ONLINE) {
      const dailyApiKey = process.env.DAILY_API_KEY;
      if (dailyApiKey) {
        try {
          const dailyRes = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${dailyApiKey}`,
            },
            body: JSON.stringify({
              name: `dr-ahmed-${Date.now()}`,
              privacy: 'private',
              properties: {
                exp: Math.floor(Date.now() / 1000) + 7200,
                enable_prejoin_ui: true,
                lang: 'ar',
              },
            }),
          });
          if (dailyRes.ok) {
            const room: any = await dailyRes.json();
            meetingId = room.name;
            meetingUrl = room.url;
          } else {
            meetingId = `room-${Math.random().toString(36).substring(2, 9)}`;
            meetingUrl = `https://meet.jit.si/${meetingId}`;
          }
        } catch (error) {
          meetingId = `room-${Math.random().toString(36).substring(2, 9)}`;
          meetingUrl = `https://meet.jit.si/${meetingId}`;
        }
      } else {
        meetingId = `room-${Math.random().toString(36).substring(2, 9)}`;
        meetingUrl = `https://meet.jit.si/${meetingId}`;
      }
    }

    return this.prisma.appointment.create({
      data: {
        patientId: data.patientId,
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        guestEmail: data.guestEmail,
        type: data.type,
        date: appointmentDate,
        timeSlot: data.timeSlot,
        notes: data.notes,
        meetingId,
        meetingUrl,
        clinicId: data.clinicId || null,
        paymentMethod: (data.paymentMethod as any) || 'NONE',
        paymentSenderNum: data.paymentSenderNum,
        paymentProofUrl: data.paymentProofUrl,
        paymentStatus: paymentStatus as any,
      },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        clinic: true,
      },
    });
  }

  async findAll(page = 1, limit = 10, filters?: { clinicId?: string; paymentStatus?: string; status?: string }) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (filters?.clinicId) where.clinicId = filters.clinicId;
    if (filters?.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters?.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: { patient: true, clinic: true },
      }),
      this.prisma.appointment.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getAvailableSlots(dateStr: string) {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();

    // Check Working Hours
    const workingHours = await this.prisma.workingHours.findFirst({
      where: { dayOfWeek, isActive: true }
    });
    if (!workingHours) return { slots: [], reason: 'Day off' };

    // Generate All Slots
    const allSlots = this.generateSlots(workingHours.startTime, workingHours.endTime, workingHours.slotDuration);

    // Get Booked Slots
    const booked = await this.prisma.appointment.findMany({
      where: {
        date: {
          gte: new Date(dateStr + 'T00:00:00'),
          lt: new Date(dateStr + 'T23:59:59'),
        },
        status: { notIn: [AppointmentStatus.REJECTED, AppointmentStatus.CANCELLED] }
      },
      select: { timeSlot: true }
    });

    // Get Blocked Slots
    const blocked = await this.prisma.blockedSlot.findMany({
      where: {
        date: {
          gte: new Date(dateStr + 'T00:00:00'),
          lt: new Date(dateStr + 'T23:59:59'),
        }
      }
    });

    const bookedSet = new Set(booked.map((b: any) => b.timeSlot));
    const blockedSet = new Set(blocked.map((b: any) => b.timeSlot).filter(Boolean));
    const isFullDayBlocked = blocked.some((b: any) => !b.timeSlot);

    if (isFullDayBlocked) return { slots: [], reason: 'Day fully blocked' };

    return {
      slots: allSlots.map(slot => ({
        time: slot,
        available: !bookedSet.has(slot) && !blockedSet.has(slot)
      }))
    };
  }

  private generateSlots(startTime: string, endTime: string, duration: number): string[] {
    const slots = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    let current = new Date();
    current.setHours(startH, startM, 0, 0);
    
    const end = new Date();
    end.setHours(endH, endM, 0, 0);

    while (current < end) {
      slots.push(current.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
      current.setMinutes(current.getMinutes() + duration);
    }
    return slots;
  }

  async findByMeetingId(meetingId: string) {
    return this.prisma.appointment.findFirst({
      where: { meetingId },
      include: { patient: true }
    });
  }

  async findByPatientId(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      orderBy: { date: 'asc' },
      include: { clinic: true },
    });
  }

  async findOne(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, clinic: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  // ─── Payment Proof ───────────────────────────────────────────────────

  async uploadPaymentProof(
    appointmentId: string,
    file: Express.Multer.File,
    senderPhone: string,
  ) {
    const appointment = await this.findOne(appointmentId);
    const proofUrl = await this.storageService.saveImage(file);
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentProofUrl: proofUrl,
        paymentSenderNum: senderPhone,
        paymentStatus: 'PENDING_REVIEW' as any,
      },
      include: { clinic: true, patient: true },
    });
  }

  async confirmPayment(
    appointmentId: string,
    action: 'confirm' | 'reject',
    adminNote?: string,
  ) {
    const appointment = await this.findOne(appointmentId);
    const paymentStatus = action === 'confirm' ? 'CONFIRMED' : 'REJECTED';
    const appointmentStatus =
      action === 'confirm' ? AppointmentStatus.APPROVED : appointment.status;

    const updated = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        paymentStatus: paymentStatus as any,
        status: appointmentStatus,
        paymentNote: adminNote,
      },
      include: { clinic: true, patient: true },
    });

    // إرسال إشعار للمريض
    const phone = appointment.guestPhone || (appointment as any).patient?.phone;
    const name = appointment.guestName || (appointment as any).patient?.name || 'مريضنا العزيز';
    const clinicName = (appointment as any).clinic?.nameAr || '';

    if (phone && action === 'confirm') {
      const formattedDate = new Date(appointment.date).toLocaleDateString('ar-EG', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      await this.whatsappService.sendAppointmentConfirmation(phone, {
        date: formattedDate,
        time: appointment.timeSlot,
        type: appointment.type,
        url: appointment.meetingUrl || undefined,
      }).catch(console.error);
    }

    return updated;
  }

  async getPendingPayments() {
    return this.prisma.appointment.findMany({
      where: { paymentStatus: 'PENDING_REVIEW' as any },
      orderBy: { createdAt: 'asc' },
      include: { patient: true, clinic: true },
    });
  }

  async updateStatus(id: string, status: AppointmentStatus, cancellationReason?: string) {
    const appointment = await this.prisma.appointment.findUnique({ 
      where: { id },
      include: { patient: true }
    });
    
    if (!appointment) throw new NotFoundException('Appointment not found');
    
    const updated = await this.prisma.appointment.update({ 
      where: { id }, 
      data: { status, cancellationReason },
      include: { patient: true }
    });

    // Send notifications if status changed to approved or rejected
    if (status === AppointmentStatus.APPROVED || status === AppointmentStatus.REJECTED) {
      const email = appointment.guestEmail || appointment.patient?.email;
      const phone = appointment.guestPhone || appointment.patient?.phone;
      const name = appointment.guestName || appointment.patient?.name || 'مريضنا العزيز';
      
      const formattedDate = new Date(appointment.date).toLocaleDateString('ar-EG', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      });

      if (email) {
        await this.emailService.sendAppointmentStatus(
          email,
          name,
          formattedDate,
          appointment.timeSlot,
          status.toLowerCase() as 'approved' | 'rejected',
          appointment.meetingUrl || undefined
        );
      }

      if (phone && status === AppointmentStatus.APPROVED) {
        await this.whatsappService.sendAppointmentConfirmation(phone, {
          date: formattedDate,
          time: appointment.timeSlot,
          type: appointment.type,
          url: appointment.meetingUrl || undefined
        });
      }
    }

    return updated;
  }

  async getStats() {
    const [total, pending, approved, completed] = await Promise.all([
      this.prisma.appointment.count(),
      this.prisma.appointment.count({ where: { status: AppointmentStatus.PENDING } }),
      this.prisma.appointment.count({ where: { status: AppointmentStatus.APPROVED } }),
      this.prisma.appointment.count({ where: { status: AppointmentStatus.COMPLETED } }),
    ]);
    return { total, pending, approved, completed };
  }
}
