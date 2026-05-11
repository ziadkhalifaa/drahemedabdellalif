import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SettingsService } from '../application/settings.service';
import { RolesGuard, Roles } from '../../../common/decorators';
import { UserRole } from '@dr-ahmed/shared';



@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get(':key')
  async get(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  @Get()
  async getAll() {
    return this.settingsService.getAll();
  }

  @Post(':key')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)

  async set(@Param('key') key: string, @Body() data: any) {
    return this.settingsService.set(key, data.value);
  }
}
