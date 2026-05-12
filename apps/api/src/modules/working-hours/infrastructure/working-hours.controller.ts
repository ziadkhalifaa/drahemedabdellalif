import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../../../common/decorators';
import { WorkingHoursService } from '../application/working-hours.service';
import { SimpleCacheInterceptor } from '../../../common/interceptors/cache.interceptor';

@Controller('working-hours')
export class WorkingHoursController {
  constructor(private readonly workingHoursService: WorkingHoursService) {}

  @Get()
  @UseInterceptors(SimpleCacheInterceptor)
  async getAll() {
    return this.workingHoursService.getAll();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Put()
  async update(@Body() body: any) {
    return this.workingHoursService.update(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Post('block')
  async block(@Body() body: { date: string; timeSlot?: string; reason?: string }) {
    return this.workingHoursService.blockSlot(body);
  }

  @Get('blocked')
  @UseInterceptors(SimpleCacheInterceptor)
  async getBlocked(@Query('date') date: string) {
    return this.workingHoursService.getBlockedSlots(date);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete('block/:id')
  async unblock(@Param('id') id: string) {
    return this.workingHoursService.unblockSlot(id);
  }
}
