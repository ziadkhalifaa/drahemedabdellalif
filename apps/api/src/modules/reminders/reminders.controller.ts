import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../../common/decorators';
import { RemindersService } from './reminders.service';

@Controller('reminders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('admin')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post('trigger')
  async trigger(@Body() body: { date: string }) {
    return this.remindersService.triggerRemindersForDate(body.date);
  }

  @Post('daily-test')
  async testDaily() {
    return this.remindersService.handleDailyReminders();
  }
}
