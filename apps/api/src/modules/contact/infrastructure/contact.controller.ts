import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ContactService } from '../application/contact.service';
import { RolesGuard, Roles } from '../../../common/decorators';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() body: { name: string; email: string; phone: string; message: string }) {
    return this.contactService.create(body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin', 'editor')
  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.contactService.findAll(+page, +limit);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.contactService.markAsRead(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.contactService.remove(id);
  }
}
