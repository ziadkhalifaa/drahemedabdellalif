import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class WorkingHoursService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return (this.prisma as any).workingHours.findMany({
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async update(data: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    slotDuration: number;
    isActive: boolean;
  }) {
    const existing = await (this.prisma as any).workingHours.findFirst({ where: { dayOfWeek: data.dayOfWeek } });
    return (this.prisma as any).workingHours.upsert({
      where: { id: existing?.id || 'new' },
      update: data,
      create: data,
    });
  }

  async blockSlot(data: { date: string; timeSlot?: string; reason?: string }) {
    return (this.prisma as any).blockedSlot.create({
      data: {
        date: new Date(data.date),
        timeSlot: data.timeSlot,
        reason: data.reason,
      },
    });
  }

  async getBlockedSlots(date: string) {
    return (this.prisma as any).blockedSlot.findMany({
      where: {
        date: {
          gte: new Date(date + 'T00:00:00'),
          lt: new Date(date + 'T23:59:59'),
        },
      },
    });
  }

  async unblockSlot(id: string) {
    return (this.prisma as any).blockedSlot.delete({ where: { id } });
  }
}
