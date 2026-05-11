import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from '../application/analytics.service';
import { RolesGuard, Roles } from '../../../common/decorators';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get('dashboard')
  async getDashboard() {
    return this.analyticsService.getDashboardStats();
  }

  @Post('track')
  async track(@Body() body: { type: string; payload: Record<string, any> }) {
    return this.analyticsService.trackEvent(body.type, body.payload);
  }
}
