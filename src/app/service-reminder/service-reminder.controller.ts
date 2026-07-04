import { Body, Controller, Get, Patch, Post } from '@nestjs/common';

import { UserFilterType } from 'src/common/common.type';
import { GetUser, UserFilter } from 'src/decorators/get-user.decorator';

import { VehicleAccessHelper } from 'src/vehicle-access/vehicle-access.helper';
import { SharedVehiclePermissionENUM } from '../shared-vehicle/entities/shared-vehicle.entity';
import { LoggedInUser } from '../user/user.type';
import { CreateServiceReminderDTO } from './dto/service-reminder.dto';
import { ServiceReminderService } from './service-reminder.service';

@Controller('service-reminder')
export class ServiceReminderController {
  constructor(
    private readonly reminderService: ServiceReminderService,
    private readonly vehicleAccessHelper: VehicleAccessHelper,
  ) {}

  @Get('my-reminder-settings')
  async findOne(@UserFilter() { userId, vehicleId }: UserFilterType) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    return this.reminderService.findOrFail({ vehicleId }, [], []);
  }

  @Get('due-reminders')
  async getDueReminders(
    @GetUser() user: LoggedInUser,
    @UserFilter() { userId, vehicleId, currentOdo }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    return this.reminderService.getDueReminder(user, {
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

  @Patch('toggle-reminder')
  toggleIsDisabled(@GetUser() user: LoggedInUser) {
    return this.reminderService.toggleIsDisabled(user);
  }
}
