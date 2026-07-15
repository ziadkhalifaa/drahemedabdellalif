import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from './decorators';
import { PrismaService } from './prisma.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '25',
    @Query('resource') resource?: string,
    @Query('action') action?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const take = Math.min(+limit || 25, 100);
    const skip = ((+page || 1) - 1) * take;

    const where: any = {};

    if (resource) {
      where.resource = resource;
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { resource: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { ip: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to + 'T23:59:59.999Z');
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    const resources = await this.prisma.auditLog.groupBy({
      by: ['resource'],
      _count: true,
      orderBy: { _count: { resource: 'desc' } },
    });

    return {
      data,
      total,
      page: +page || 1,
      totalPages: Math.ceil(total / take),
      resources: resources.map(r => ({ resource: r.resource, count: r._count })),
    };
  }
}
