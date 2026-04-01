import { Body, Controller, Get, Post } from '@nestjs/common';

import { UserFilterType } from 'src/common/common.type';
import { GetUser, UserFilter } from 'src/decorators/get-user.decorator';

import { LoggedInUser } from '../user/user.type';
import { CreateServiceReminderDTO } from './dto/service-reminder.dto';
import { ServiceReminderService } from './service-reminder.service';

@Controller('service-reminder')
export class ServiceReminderController {
  constructor(private readonly reminderService: ServiceReminderService) {}

  @Get('my-reminder-settings')
  findOne(@UserFilter() { userId, vehicleId }: UserFilterType) {
    return this.reminderService.findOrFail({ userId, vehicleId }, [], []);
  }

  @Get('due-reminders')
  getDueReminders(
    @UserFilter() { userId, vehicleId, currentOdo }: UserFilterType,
  ) {
    return this.reminderService.getDueReminder({
      userId,
      vehicleId,
      currentOdo,
    });
  }

  @Post()
  create(
    @Body() body: CreateServiceReminderDTO,
    @GetUser() user: LoggedInUser,
  ) {
    return this.reminderService.create(body, user);
  }
}
