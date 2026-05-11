import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from '../application/media.service';
import { StorageService } from '../application/storage.service';

import { RolesGuard, Roles } from '../../../common/decorators';
import { UserRole } from '@dr-ahmed/shared';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly storage: StorageService
  ) {}

  @Get()
  async findAll(@Query('type') type?: string) {
    if (type) return this.mediaService.findByType(type);
    return this.mediaService.findActive();
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async findAllAdmin() {
    return this.mediaService.findAll();
  }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    if (file.mimetype.startsWith('image/')) {
      const url = await this.storage.saveImage(file);
      return { url };
    } else if (file.mimetype.startsWith('video/')) {
      const url = await this.storage.saveVideo(file);
      return { url };
    }

    throw new BadRequestException('Invalid file type. Only images and videos are allowed.');
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() data: any) {
    return this.mediaService.create(data);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() data: any) {
    return this.mediaService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.mediaService.remove(id);
  }
}
