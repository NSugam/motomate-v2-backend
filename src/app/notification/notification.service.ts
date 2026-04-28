import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { Repository } from 'typeorm';

import { LoggedInUser } from '../user/user.type';
import { CreateNotificationDTO } from './dto/create-notification.dto';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly expo = new Expo();

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  async createAndSend(user: LoggedInUser, data: CreateNotificationDTO) {
    try {
      // Validate vehicle ID
      const vehicleId = user.defaultVehicleId;
      if (!vehicleId) {
        this.logger.warn(
          `User ${user.id} has no default vehicle, skipping notification`,
        );
        return {
          success: false,
          message: 'No default vehicle assigned',
        };
      }

      // Check for recent notifications with priority-based cooldown
      const exists = await this.notificationRepo.findOne({
        where: {
          userId: user.id,
          vehicleId,
          type: data.type,
        },
        order: { createdAt: 'DESC' },
      });

      if (
        exists &&
        this.isRecent(
          exists.createdAt,
          (data.meta?.priority as string) || 'normal',
        )
      ) {
        this.logger.debug(
          `Skipping notification for user ${user.id} - recent notification exists`,
        );
        return {
          success: false,
          message: 'Already notified recently',
        };
      }

      // Create and save notification
      const notification = this.notificationRepo.create({
        userId: user.id,
        vehicleId,
        title: data.title,
        body: data.body,
        type: data.type,
        meta: {
          ...data.meta,
          deliveryStatus: 'pending',
          createdAt: new Date().toISOString(),
        },
      });

      const savedNotification = await this.notificationRepo.save(notification);

      // Get valid push tokens
      const tokens = (user.devices ?? [])
        .map((d) => d.expoToken)
        .filter(Boolean)
        .filter((token) => Expo.isExpoPushToken(token));

      if (tokens.length) {
        const pushResult = await this.sendPushWithRetry(
          tokens,
          data.title,
          data.body,
          (data.meta?.priority as string) || 'normal',
        );

        // Update notification with delivery status
        await this.notificationRepo
          .createQueryBuilder()
          .update(Notification)
          .set({
            meta: () => `jsonb_set(
              COALESCE(meta::jsonb, '{}'::jsonb),
              '{deliveryStatus}', '"${pushResult.success ? 'delivered' : 'failed'}"'::jsonb
            ) || jsonb_set(
              COALESCE(meta::jsonb, '{}'::jsonb),
              '{deliveryAttempts}', '${pushResult.attempts}'::jsonb
            ) || jsonb_set(
              COALESCE(meta::jsonb, '{}'::jsonb),
              '{lastDeliveryAttempt}', '"${new Date().toISOString()}"'::jsonb
            ) || jsonb_set(
              COALESCE(meta::jsonb, '{}'::jsonb),
              '{failedTokens}', '${JSON.stringify(pushResult.failedTokens)}'::jsonb
            )`,
          })
          .where('id = :id', { id: savedNotification.id })
          .execute();

        this.logger.log(
          `Notification ${savedNotification.id} - Status: ${pushResult.success ? 'delivered' : 'failed'}, Tokens: ${tokens.length}, Attempts: ${pushResult.attempts}`,
        );
      } else {
        this.logger.warn(`No valid push tokens found for user ${user.id}`);
        await this.notificationRepo
          .createQueryBuilder()
          .update(Notification)
          .set({
            meta: () => `jsonb_set(
              COALESCE(meta::jsonb, '{}'::jsonb),
              '{deliveryStatus}', '"no_tokens"'::jsonb
            ) || jsonb_set(
              COALESCE(meta::jsonb, '{}'::jsonb),
              '{lastDeliveryAttempt}', '"${new Date().toISOString()}"'::jsonb
            )`,
          })
          .where('id = :id', { id: savedNotification.id })
          .execute();
      }

      return { success: true, notificationId: savedNotification.id };
    } catch (error) {
      this.logger.error(
        `Failed to create and send notification for user ${user.id}`,
        error,
      );
      return {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async sendPushWithRetry(
    tokens: string[],
    title: string,
    body: string,
    priority: string = 'medium',
    maxRetries: number = 3,
  ): Promise<{ success: boolean; attempts: number; failedTokens: string[] }> {
    let attempts = 0;
    let failedTokens: string[] = [];

    while (attempts < maxRetries) {
      attempts++;

      try {
        const result = await this.sendPush(tokens, title, body, priority);
        if (result.success) {
          return { success: true, attempts, failedTokens };
        }

        failedTokens = result.failedTokens || [];

        // Exponential backoff
        if (attempts < maxRetries) {
          const delay = Math.pow(2, attempts) * 1000; // 2s, 4s, 8s
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        this.logger.error(
          `Push notification attempt ${attempts} failed`,
          error,
        );

        if (attempts === maxRetries) {
          return { success: false, attempts, failedTokens };
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    return { success: false, attempts, failedTokens };
  }

  async sendPush(
    tokens: string[],
    title: string,
    body: string,
    priority: string = 'medium',
  ): Promise<{ success: boolean; failedTokens?: string[] }> {
    const validTokens = tokens.filter((t) => Expo.isExpoPushToken(t));

    if (!validTokens.length) {
      return { success: false, failedTokens: tokens };
    }

    // Map our priority levels to Expo's valid priorities
    const expoPriority =
      priority === 'high' ? 'high' : priority === 'low' ? 'normal' : 'default';

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      priority: expoPriority,
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    const failedTokens: string[] = [];
    let hasFailures = false;

    for (const chunk of chunks) {
      try {
        const result = await this.expo.sendPushNotificationsAsync(chunk);

        // Handle failed tokens
        for (let i = 0; i < result.length; i++) {
          const ticket = result[i];
          const originalMessage = chunk[i];

          if (ticket.status === 'error') {
            hasFailures = true;

            // Handle device errors (invalid tokens)
            if (ticket.details?.error === 'DeviceNotRegistered') {
              const failedToken = originalMessage.to as string;
              failedTokens.push(failedToken);
              this.logger.warn(
                `Device token no longer registered: ${failedToken}`,
              );
            } else {
              this.logger.error(
                `Push notification failed: ${ticket.message}`,
                ticket.details,
              );
            }
          }
        }
      } catch (error) {
        this.logger.error('Push chunk failed', error);
        hasFailures = true;
      }
    }

    return {
      success: !hasFailures,
      failedTokens: failedTokens.length > 0 ? failedTokens : undefined,
    };
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

  private isRecent(date: Date, priority: string = 'medium'): boolean {
    const now = Date.now();
    const notificationTime = new Date(date).getTime();
    const diff = now - notificationTime;

    // Priority-based cooldowns
    const cooldowns = {
      high: 1000 * 60 * 60, // 1 hour
      medium: 1000 * 60 * 60 * 6, // 6 hours
      low: 1000 * 60 * 60 * 24, // 24 hours
    };

    const cooldown =
      cooldowns[priority as keyof typeof cooldowns] || cooldowns.medium;
    return diff < cooldown;
  }
}
