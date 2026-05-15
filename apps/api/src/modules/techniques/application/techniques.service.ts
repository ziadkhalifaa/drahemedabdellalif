import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';

@Injectable()
export class TechniquesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.technique.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findActive() {
    return this.prisma.technique.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(slug: string) {
    return this.prisma.technique.findUnique({
      where: { slug },
    });
  }

  async create(data: any) {
    return this.prisma.technique.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.technique.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.technique.delete({
      where: { id },
    });
  }

  async reorder(orderedIds: string[]) {
    const transactions = orderedIds.map((id, index) =>
      this.prisma.technique.update({
        where: { id },
        data: { order: index + 1 },
      })
    );
    return this.prisma.$transaction(transactions);
  }
}
