import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

import { LoggedInUser } from '../user/user.type';
import { CreateNotificationDTO } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly expo = new Expo();

  constructor() {}

  async createAndSend(user: LoggedInUser, data: CreateNotificationDTO) {
    try {
      // Use provided vehicleId or fall back to default
      const targetVehicleId = data.vehicleId || user.defaultVehicleId;
      if (!targetVehicleId) {
        this.logger.warn(
          `User ${user.id} has no target vehicle, skipping notification`,
        );
        return {
          success: false,
          message: 'No target vehicle assigned',
        };
      }

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

        this.logger.log(
          `Notification sent to user ${user.id} - Status: ${pushResult.success ? 'delivered' : 'failed'}, Tokens: ${tokens.length}, Attempts: ${pushResult.attempts}`,
        );

        return {
          success: pushResult.success,
          failedTokens: pushResult.failedTokens,
        };
      } else {
        this.logger.warn(`No valid push tokens found for user ${user.id}`);
        return { success: false, message: 'No valid push tokens' };
      }
    } catch (error) {
      this.logger.error(
        `Failed to send notification for user ${user.id}`,
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
}
