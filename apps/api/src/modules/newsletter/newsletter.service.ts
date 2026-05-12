import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(email: string, name?: string) {
    return this.prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true, name },
      create: { email, name },
    });
  }

  async unsubscribe(email: string) {
    return this.prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false },
    });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.newsletterSubscriber.count(),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async remove(id: string) {
    return this.prisma.newsletterSubscriber.delete({ where: { id } });
  }
}
