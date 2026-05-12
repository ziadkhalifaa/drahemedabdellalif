import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BlogService } from '../application/blog.service';
import { RolesGuard, Roles } from '../../../common/decorators';
import { BlogPostStatus } from '@prisma/client';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async findAll(
    @Query('status') status?: BlogPostStatus,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    return this.blogService.findAll(status, +page, +limit);
  }

  @Get('published')
  async findPublished() {
    return this.blogService.findPublished();
  }

  @Get('categories')
  async getCategories() {
    return this.blogService.getCategories();
  }

  @Get('tags')
  async getTags() {
    return this.blogService.getTags();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Post()
  async create(@Body() body: {
    titleAr: string; titleEn: string;
    slugAr: string; slugEn: string;
    contentAr: string; contentEn: string;
    excerptAr?: string; excerptEn?: string;
    metaTitleAr?: string; metaTitleEn?: string;
    metaDescriptionAr?: string; metaDescriptionEn?: string;
    keywords?: string;
    categoryId?: string; status?: BlogPostStatus;
  }) {
    return this.blogService.create(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.blogService.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
