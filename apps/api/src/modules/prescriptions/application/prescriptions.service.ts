import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { 
    appointmentId: string; 
    patientId: string; 
    diagnosisAr?: string; 
    diagnosisEn?: string; 
    medications: any;
    instructionsAr?: string;
    instructionsEn?: string;
  }) {
    return this.prisma.prescription.create({
      data: {
        ...data,
        isIssued: true,
        issuedAt: new Date(),
      },
    });
  }

  async findByPatient(patientId: string) {
    return this.prisma.prescription.findMany({
      where: { patientId },
      include: { appointment: { include: { patient: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: { 
        appointment: { include: { patient: true } },
        patient: true 
      },
    });
    if (!prescription) throw new NotFoundException('Prescription not found');
    return prescription;
  }

  async getMyPrescriptions(userId: string) {
    return this.prisma.prescription.findMany({
      where: { patientId: userId },
      include: { appointment: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
