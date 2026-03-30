import { Body, Controller, Get, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { LoggedInUser } from '../user/user.type';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('send')
  sendNotification(
    @GetUser() user: LoggedInUser,
    @Body() createNotificationDto: CreateNotificationDTO,
  ) {
    return this.notificationService.sendExpoNotification(
      createNotificationDto,
      user,
    );
  }

  @Get()
  findAll() {
    return this.notificationService.findAll();
  }
}
