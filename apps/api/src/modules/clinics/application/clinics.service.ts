import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class ClinicsService {
  constructor(private readonly prisma: PrismaService) {}

  // ──────────────────────────────────────────────
  // Public endpoints
  // ──────────────────────────────────────────────

  async findAll() {
    return this.prisma.clinic.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: { workingHours: { where: { isActive: true } } },
    });
  }

  async findOne(id: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: { id },
      include: { workingHours: true },
    });
    if (!clinic) throw new NotFoundException('العيادة غير موجودة');
    return clinic;
  }

  async getAvailableSlots(clinicId: string, dateStr: string): Promise<string[]> {
    const targetDate = new Date(dateStr);
    const dayOfWeek = targetDate.getDay();

    // 1. جلب ساعات العمل لهذا اليوم
    const workingHours = await this.prisma.clinicWorkingHours.findUnique({
      where: { clinicId_dayOfWeek: { clinicId, dayOfWeek } },
    });
    if (!workingHours || !workingHours.isActive) return [];

    // 2. توليد كل الأوقات الممكنة
    const allSlots = this.generateTimeSlots(
      workingHours.startTime,
      workingHours.endTime,
      workingHours.slotDuration,
    );

    // 3. مواعيد محجوزة مسبقاً
    const startOfDay = new Date(dateStr + 'T00:00:00');
    const endOfDay = new Date(dateStr + 'T23:59:59');

    const bookedAppointments = await this.prisma.appointment.findMany({
      where: {
        clinicId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { notIn: ['rejected', 'cancelled'] },
      },
      select: { timeSlot: true },
    });
    const bookedSlots = new Set(bookedAppointments.map((a) => a.timeSlot));

    // 4. أوقات محجوبة يدوياً
    const blockedSlots = await this.prisma.clinicBlockedSlot.findMany({
      where: {
        clinicId,
        date: { gte: startOfDay, lte: endOfDay },
      },
    });

    // إذا كان اليوم محجوباً بالكامل
    if (blockedSlots.some((b) => !b.timeSlot)) return [];

    const blockedTimes = new Set(blockedSlots.map((b) => b.timeSlot).filter(Boolean));

    // 5. إرجاع المتاح فقط
    return allSlots.filter((slot) => !bookedSlots.has(slot) && !blockedTimes.has(slot));
  }

  // ──────────────────────────────────────────────
  // Admin endpoints
  // ──────────────────────────────────────────────

  async create(data: {
    nameAr: string;
    nameEn: string;
    addressAr: string;
    addressEn: string;
    phone?: string;
    mapUrl?: string;
    imageUrl?: string;
    order?: number;
  }) {
    return this.prisma.clinic.create({ data });
  }

  async update(
    id: string,
    data: {
      nameAr?: string;
      nameEn?: string;
      addressAr?: string;
      addressEn?: string;
      phone?: string;
      mapUrl?: string;
      imageUrl?: string;
      isActive?: boolean;
      order?: number;
    },
  ) {
    return this.prisma.clinic.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.clinic.delete({ where: { id } });
  }

  async setWorkingHours(
    clinicId: string,
    hours: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      slotDuration?: number;
      isActive?: boolean;
    }[],
  ) {
    // upsert لكل يوم
    const results = await Promise.all(
      hours.map((h) =>
        this.prisma.clinicWorkingHours.upsert({
          where: { clinicId_dayOfWeek: { clinicId, dayOfWeek: h.dayOfWeek } },
          create: {
            clinicId,
            dayOfWeek: h.dayOfWeek,
            startTime: h.startTime,
            endTime: h.endTime,
            slotDuration: h.slotDuration ?? 30,
            isActive: h.isActive ?? true,
          },
          update: {
            startTime: h.startTime,
            endTime: h.endTime,
            slotDuration: h.slotDuration ?? 30,
            isActive: h.isActive ?? true,
          },
        }),
      ),
    );
    return results;
  }

  async addBlockedSlot(
    clinicId: string,
    data: { date: string; timeSlot?: string; reason?: string },
  ) {
    return this.prisma.clinicBlockedSlot.create({
      data: {
        clinicId,
        date: new Date(data.date),
        timeSlot: data.timeSlot || null,
        reason: data.reason,
      },
    });
  }

  async removeBlockedSlot(slotId: string) {
    return this.prisma.clinicBlockedSlot.delete({ where: { id: slotId } });
  }

  async getWorkingHours(clinicId: string) {
    return this.prisma.clinicWorkingHours.findMany({
      where: { clinicId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async getBlockedSlots(clinicId: string) {
    return this.prisma.clinicBlockedSlot.findMany({
      where: {
        clinicId,
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
    });
  }

  // ──────────────────────────────────────────────
  // Helper
  // ──────────────────────────────────────────────

  private generateTimeSlots(startTime: string, endTime: string, duration: number): string[] {
    const slots: string[] = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let current = new Date();
    current.setHours(startH, startM, 0, 0);

    const end = new Date();
    end.setHours(endH, endM, 0, 0);

    while (current < end) {
      const h = current.getHours().toString().padStart(2, '0');
      const m = current.getMinutes().toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
      current.setMinutes(current.getMinutes() + duration);
    }
    return slots;
  }
}
