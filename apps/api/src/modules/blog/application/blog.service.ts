import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { BlogPostStatus } from '@prisma/client';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    titleAr: string; titleEn: string;
    slugAr: string; slugEn: string;
    contentAr: string; contentEn: string;
    excerptAr?: string; excerptEn?: string;
    metaTitleAr?: string; metaTitleEn?: string;
    metaDescriptionAr?: string; metaDescriptionEn?: string;
    keywords?: string;
    categoryId?: string;
    status?: BlogPostStatus;
  }) {
    return this.prisma.blogPost.create({ data, include: { category: true, tags: { include: { tag: true } } } });
  }

  async findAll(status?: BlogPostStatus, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    
    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({ 
        where, 
        include: { category: true, tags: { include: { tag: true } } }, 
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.blogPost.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findPublished() {
    return this.prisma.blogPost.findMany({
      where: { status: 'published' },
      include: { category: true, tags: { include: { tag: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { OR: [{ slugAr: slug }, { slugEn: slug }] },
      include: { category: true, tags: { include: { tag: true } } },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async findOne(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id }, include: { category: true, tags: { include: { tag: true } } } });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async update(id: string, data: Partial<{
    titleAr: string; titleEn: string;
    slugAr: string; slugEn: string;
    contentAr: string; contentEn: string;
    excerptAr: string; excerptEn: string;
    metaTitleAr: string; metaTitleEn: string;
    metaDescriptionAr: string; metaDescriptionEn: string;
    keywords: string;
    categoryId: string; status: BlogPostStatus;
  }>) {
    await this.findOne(id);
    return this.prisma.blogPost.update({ where: { id }, data, include: { category: true, tags: { include: { tag: true } } } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.blogPost.delete({ where: { id } });
  }

  async getCategories() {
    return this.prisma.category.findMany({ orderBy: { nameAr: 'asc' } });
  }

  async createCategory(data: { nameAr: string; nameEn: string; slugAr: string; slugEn: string }) {
    return this.prisma.category.create({ data });
  }

  async getTags() {
    return this.prisma.tag.findMany({ orderBy: { nameAr: 'asc' } });
  }

  async createTag(data: { nameAr: string; nameEn: string; slugAr: string; slugEn: string }) {
    return this.prisma.tag.create({ data });
  }
}
