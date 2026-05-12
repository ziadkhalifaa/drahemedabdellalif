import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; email: string; phone: string; message: string }) {
    return this.prisma.contactMessage.create({ data });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.contactMessage.findMany({ 
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.contactMessage.count()
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async markAsRead(id: string) {
    const msg = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!msg) throw new NotFoundException('Message not found');
    return this.prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
  }

  async remove(id: string) {
    const msg = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!msg) throw new NotFoundException('Message not found');
    return this.prisma.contactMessage.delete({ where: { id } });
  }
}
