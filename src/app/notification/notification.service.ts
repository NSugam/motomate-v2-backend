/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { Repository } from 'typeorm';

import { LoggedInUser } from '../user/user.type';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  private expo = new Expo();

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async createAndSend(user: LoggedInUser, data: CreateNotificationDTO) {
    const vehicleId = user.defaultVehicleId;

    const exists = await this.notificationRepo.findOne({
      where: {
        userId: user.id,
        vehicleId,
        type: data.type,
      },
      order: { createdAt: 'DESC' },
    });

    if (exists && !this.isRecent(exists.createdAt)) {
      return {
        success: false,
        message: 'Already notified recently',
      };
    }

    const notification = this.notificationRepo.create({
      userId: user.id,
      vehicleId,
      title: data.title,
      body: data.body,
      type: data.type,
      meta: data.meta,
    });

    await this.notificationRepo.save(notification);

    const tokens = (user.devices ?? []).map((d) => d.expoToken).filter(Boolean);

    if (tokens.length) {
      await this.sendPush(tokens, data.title, data.body);
    }

    return { success: true };
  }

  async sendPush(tokens: string[], title: string, body: string) {
    const validTokens = tokens.filter((t) => Expo.isExpoPushToken(t));

    if (!validTokens.length) return;

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      priority: 'high',
    }));

    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (err) {
        console.error('Push failed:', err);
      }
    }
  }

  async getUserNotifications(userId: string) {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string) {
    await this.notificationRepo.update({ id, userId }, { isRead: true });
  }

  private isRecent(date: Date) {
    const diff = Date.now() - new Date(date).getTime();
    return diff < 1000 * 60 * 60 * 6; // 6 hrs
  }
}
