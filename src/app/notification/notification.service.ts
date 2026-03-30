import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { LoggedInUser, UserRoleENUM } from '../user/user.type';
import { CreateNotificationDTO } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  findAll() {
    return `This action returns all notification`;
  }

  async sendExpoNotification(data: CreateNotificationDTO, user: LoggedInUser) {
    const message = {
      to:
        data.expoToken && user.role === UserRoleENUM.ADMIN
          ? data.expoToken
          : user.ExpoToken,
      sound: 'default',
      title: data.title,
      body: data.body,
      priority: 'high',
    };

    try {
      const response = await axios.post(
        'https://exp.host/--/api/v2/push/send',
        message,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Notification sent:', response.data);
      return { success: true };
    } catch (err) {
      console.error('  Failed to send Expo push:', err);
      return { success: false, err };
    }
  }
}
