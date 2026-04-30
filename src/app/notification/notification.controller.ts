import { Body, Controller, Patch } from '@nestjs/common';
import { GetUser } from 'src/decorators/get-user.decorator';
import { LoggedInUser } from '../user/user.type';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Patch('test')
  test(@GetUser() user: LoggedInUser, @Body() body: CreateNotificationDTO) {
    return this.notificationService.createAndSend(user, body);
  }
}
