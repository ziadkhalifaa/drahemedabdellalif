import { Controller, Post, Get, Delete, Body, Query, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NewsletterService } from './newsletter.service';
import { RolesGuard, Roles } from '../../common/decorators';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('subscribe')
  async subscribe(@Body() body: { email: string; name?: string }) {
    return this.newsletterService.subscribe(body.email, body.name);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.newsletterService.findAll(+page, +limit);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.newsletterService.remove(id);
  }
}
