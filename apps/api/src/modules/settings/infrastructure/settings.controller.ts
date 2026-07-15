import { Controller, Get, Post, Put, Body, Param, UseGuards, Header, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipThrottle } from '@nestjs/throttler';
import { SettingsService } from '../application/settings.service';
import { RolesGuard, Roles } from '../../../common/decorators';
import { UserRole } from '@dr-ahmed/shared';
import { SimpleCacheInterceptor } from '../../../common/interceptors/cache.interceptor';



@SkipThrottle()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public')
  @UseInterceptors(SimpleCacheInterceptor)
  @Header('Cache-Control', 'public, max-age=300, stale-while-revalidate=600')
  async getPublic() {
    return this.settingsService.getAll();
  }

  @Get(':key')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  async get(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  @Get()
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  async getAll() {
    return this.settingsService.getAll();
  }

  @SkipThrottle({ default: false })
  @Post(':key')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async set(@Param('key') key: string, @Body() data: any) {
    return this.settingsService.set(key, data.value);
  }

  @SkipThrottle({ default: false })
  @Put()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async setMultiple(@Body() data: { settings: { key: string; value: any }[] }) {
    return this.settingsService.setMultiple(data.settings);
  }
}
