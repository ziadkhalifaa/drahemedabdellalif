import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class HeroService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.heroSlide.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findActive() {
    return this.prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async create(data: any) {
    return this.prisma.heroSlide.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.heroSlide.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.heroSlide.delete({
      where: { id },
    });
  }

  async reorder(orderedIds: string[]) {
    const transactions = orderedIds.map((id, index) =>
      this.prisma.heroSlide.update({
        where: { id },
        data: { order: index + 1 },
      })
    );
    return this.prisma.$transaction(transactions);
  }
}
