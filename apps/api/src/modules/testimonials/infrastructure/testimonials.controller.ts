import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TestimonialsService } from '../application/testimonials.service';
import { RolesGuard, Roles } from '../../../common/decorators';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  async findVisible() {
    return this.testimonialsService.findVisible();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Get('all')
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.testimonialsService.findAll(+page, +limit);
  }

  @Post()
  async create(@Body() body: { patientName: string; content: string; rating: number }) {
    return this.testimonialsService.create(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.testimonialsService.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/approve')
  async approve(@Param('id') id: string) {
    return this.testimonialsService.approve(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.testimonialsService.remove(id);
  }
}
