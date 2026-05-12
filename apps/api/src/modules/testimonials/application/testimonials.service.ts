import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.testimonial.findMany({ 
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.testimonial.count()
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findVisible() {
    return this.prisma.testimonial.findMany({
      where: { isApproved: true, isVisible: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const testimonial = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) throw new NotFoundException('Testimonial not found');
    return testimonial;
  }

  async create(data: { patientName: string; content: string; rating: number; patientAvatar?: string }) {
    return this.prisma.testimonial.create({ data });
  }

  async update(id: string, data: Partial<{ patientName: string; content: string; rating: number; patientAvatar: string; isApproved: boolean; isVisible: boolean }>) {
    await this.findOne(id);
    return this.prisma.testimonial.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.testimonial.delete({ where: { id } });
  }

  async approve(id: string) {
    await this.findOne(id);
    return this.prisma.testimonial.update({ where: { id }, data: { isApproved: true, isVisible: true } });
  }
}
