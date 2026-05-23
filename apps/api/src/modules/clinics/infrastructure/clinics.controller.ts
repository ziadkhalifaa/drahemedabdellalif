import {
  Controller, Get, Post, Put, Patch, Delete, Header,
  Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';
import { ClinicsService } from '../application/clinics.service';
import { RolesGuard, Roles } from '../../../common/decorators';

@SkipThrottle()
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  // ─── Public ────────────────────────────────────────────────────────────

  @Get()
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  findAll() {
    return this.clinicsService.findAll();
  }

  @Get(':id')
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  findOne(@Param('id') id: string) {
    return this.clinicsService.findOne(id);
  }

  @Get(':id/available-slots')
  getAvailableSlots(@Param('id') id: string, @Query('date') date: string) {
    return this.clinicsService.getAvailableSlots(id, date);
  }

  @Get(':id/working-hours')
  getWorkingHours(@Param('id') id: string) {
    return this.clinicsService.getWorkingHours(id);
  }

  @Get(':id/blocked-slots')
  getBlockedSlots(@Param('id') id: string) {
    return this.clinicsService.getBlockedSlots(id);
  }

  // ─── Admin ────────────────────────────────────────────────────────────

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @SkipThrottle({ default: false })
  @Post()
  create(@Body() body: {
    nameAr: string; nameEn: string;
    addressAr: string; addressEn: string;
    phone?: string; mapUrl?: string; imageUrl?: string; order?: number;
  }) {
    return this.clinicsService.create(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @SkipThrottle({ default: false })
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.clinicsService.update(id, body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @SkipThrottle({ default: false })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clinicsService.remove(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @SkipThrottle({ default: false })
  @Put(':id/working-hours')
  setWorkingHours(
    @Param('id') clinicId: string,
    @Body() body: {
      hours: {
        dayOfWeek: number; startTime: string;
        endTime: string; slotDuration?: number; isActive?: boolean;
      }[]
    },
  ) {
    return this.clinicsService.setWorkingHours(clinicId, body.hours);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @SkipThrottle({ default: false })
  @Post(':id/blocked-slots')
  addBlockedSlot(
    @Param('id') clinicId: string,
    @Body() body: { date: string; timeSlot?: string; reason?: string },
  ) {
    return this.clinicsService.addBlockedSlot(clinicId, body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @SkipThrottle({ default: false })
  @Delete(':id/blocked-slots/:slotId')
  removeBlockedSlot(@Param('slotId') slotId: string) {
    return this.clinicsService.removeBlockedSlot(slotId);
  }
}
