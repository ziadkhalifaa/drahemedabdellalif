import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { StorageService } from '../media/application/storage.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService
  ) {}

  async getMyReports(patientId: string) {
    return this.prisma.medicalReport.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByAppointment(appointmentId: string) {
    return this.prisma.medicalReport.findMany({
      where: { appointmentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const report = await this.prisma.medicalReport.findUnique({
      where: { id },
      include: { patient: true, appointment: true },
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.medicalReport.findMany({ 
        orderBy: { createdAt: 'desc' },
        include: { patient: true, appointment: true },
        skip,
        take: limit,
      }),
      this.prisma.medicalReport.count()
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async create(data: { title: string; patientId: string; description?: string; appointmentId?: string }, file?: Express.Multer.File) {
    let fileUrl = '';
    if (file) {
      fileUrl = await this.storageService.uploadFile(file, 'reports');
    }
    return this.prisma.medicalReport.create({
      data: {
        title: data.title,
        description: data.description,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        fileUrl,
      },
      include: { patient: true, appointment: true }
    });
  }

  async remove(id: string) {
    return this.prisma.medicalReport.delete({ where: { id } });
  }
}
