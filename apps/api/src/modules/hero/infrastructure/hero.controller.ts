import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { HeroService } from '../application/hero.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../../../common/decorators';
import { UserRole } from '@dr-ahmed/shared';

@Controller('hero-slides')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  @Get()
  async findAll() {
    return this.heroService.findActive();
  }

  @Get('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAllForAdmin() {
    return this.heroService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() data: any) {
    return this.heroService.create(data);
  }

  @Patch('reorder')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async reorder(@Body() data: { orderedIds: string[] }) {
    return this.heroService.reorder(data.orderedIds);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() data: any) {
    return this.heroService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.heroService.remove(id);
  }
}
