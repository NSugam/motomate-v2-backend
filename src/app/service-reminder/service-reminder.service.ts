import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import NepaliDate from 'nepali-date-converter';
import { UserFilterType } from 'src/common/common.type';
import { FindOneFn, FindOrFailFn } from 'src/common/orm.type';
import { Repository } from 'typeorm';
import { NotificationTypeENUM } from '../notification/dto/create-notification.dto';
import { NotificationService } from '../notification/notification.service';
import { Servicing } from '../servicing/entities/servicing.entity';
import { LoggedInUser } from '../user/user.type';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { ReminderTypeENUM } from './dto/reminder.types';
import { CreateServiceReminderDTO } from './dto/service-reminder.dto';
import { ServiceReminder } from './entities/service-reminder.entity';

@Injectable()
export class ServiceReminderService {
  constructor(
    @InjectRepository(ServiceReminder)
    private readonly reminderRepo: Repository<ServiceReminder>,
    @InjectRepository(Servicing)
    private readonly servicingRepo: Repository<Servicing>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(payload: CreateServiceReminderDTO, user: LoggedInUser) {
    const existing = await this.reminderRepo.findOne({
      where: {
        userId: user.id,
        vehicleId: user.defaultVehicleId,
      },
    });

    let data = existing;
    let settingsChanged = false;

    if (!data) {
      data = this.reminderRepo.create({
        userId: user.id,
        vehicleId: user.defaultVehicleId,
      });
    }

    // Update type first
    if (payload.type && payload.type !== data.type) {
      data.type = payload.type;
      settingsChanged = true;
    }

    const finalType = payload.type ?? data.type;

    if (finalType === ReminderTypeENUM.BOTH) {
      if (
        payload.odoInterval !== undefined &&
        payload.odoInterval !== data.odoInterval
      ) {
        data.odoInterval = payload.odoInterval;
        settingsChanged = true;
      }
      if (
        payload.dateInterval !== undefined &&
        payload.dateInterval !== data.dateInterval
      ) {
        data.dateInterval = payload.dateInterval;
        settingsChanged = true;
      }
    }

    if (finalType === ReminderTypeENUM.ODO) {
      if (
        payload.odoInterval !== undefined &&
        payload.odoInterval !== data.odoInterval
      ) {
        data.odoInterval = payload.odoInterval;
        settingsChanged = true;
      }
      if (data.dateInterval !== null) {
        data.dateInterval = null;
        settingsChanged = true;
      }
    }

    if (finalType === ReminderTypeENUM.DATE) {
      if (
        payload.dateInterval !== undefined &&
        payload.dateInterval !== data.dateInterval
      ) {
        data.dateInterval = payload.dateInterval;
        settingsChanged = true;
      }
      if (data.odoInterval !== null) {
        data.odoInterval = null;
        settingsChanged = true;
      }
    }

    // Handle disabled status
    if (
      payload.isDisabled !== undefined &&
      payload.isDisabled !== data.isDisabled
    ) {
      data.isDisabled = payload.isDisabled;
      settingsChanged = true;
    }

    // Reset notification tracking if any settings changed
    if (settingsChanged) {
      data.lastNotified = null;
      data.lastNotificationPriority = null;
      data.settingsUpdatedAt = new Date();
    }

    const saved = await this.reminderRepo.save(data);

    await this.getDueReminder(user, {
      userId: user.id,
      vehicleId: user.defaultVehicleId,
      currentOdo: user.defaultVehicle.odoReading,
    });

    return {
      message: existing
        ? 'Service Reminder Updated Successfully'
        : 'Service Reminder Added Successfully',
      id: saved.id,
    };
  }

  findOne: FindOneFn<ServiceReminder> = (where, select, relations) => {
    return this.reminderRepo.findOne({ where, select, relations });
  };

  findOrFail: FindOrFailFn<ServiceReminder> = async (
    where,
    select = [],
    relations = [],
  ) => {
    return this.reminderRepo.findOneOrFail({ where, select, relations });
  };

  async getDueReminder(
    user: LoggedInUser,
    { userId, vehicleId, currentOdo }: UserFilterType,
  ) {
    const reminder = await this.reminderRepo.findOne({
      where: { userId, vehicleId },
    });

    if (!reminder) {
      return { due: false, message: 'No reminder set' };
    }

    const lastService = await this.servicingRepo.findOne({
      where: { userId, vehicleId },
      order: { odoReading: 'DESC' },
    });

    if (!lastService) {
      return { due: false, message: 'No servicing data found' };
    }

    let odoDue = false;
    let dateDue = false;

    let nextOdo: number | null = null;
    let remainingKm: number | null = null;

    let nextDateEnglish: string | null = null;
    let nextDateNepali: string | null = null;
    let daysLeft: number | null = null;

    /* ================= ODO ================= */
    if (
      reminder.type === ReminderTypeENUM.ODO ||
      reminder.type === ReminderTypeENUM.BOTH
    ) {
      if (reminder.odoInterval) {
        nextOdo = Number(lastService.odoReading) + reminder.odoInterval;
        remainingKm = Math.max(0, nextOdo - currentOdo);
        odoDue = currentOdo >= nextOdo;
      }
    }

    if (
      reminder.type === ReminderTypeENUM.DATE ||
      reminder.type === ReminderTypeENUM.BOTH
    ) {
      if (reminder.dateInterval) {
        const lastDate = new Date(lastService.englishDate);

        const nextDate = new Date(lastDate);
        nextDate.setDate(nextDate.getDate() + reminder.dateInterval);

        nextDateEnglish = nextDate.toISOString().split('T')[0];

        const nepali = new NepaliDate(nextDate);
        nextDateNepali = nepali.format('YYYY MMMM DD', 'np');

        const today = new Date();

        const diffTime =
          nextDate.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);

        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        dateDue = today >= nextDate;
      }
    }

    /* ================= FINAL ================= */
    const isDue =
      reminder.type === ReminderTypeENUM.BOTH
        ? odoDue || dateDue
        : reminder.type === ReminderTypeENUM.ODO
          ? odoDue
          : dateDue;

    await this.sendServiceReminders(
      user,
      {
        isDue,
        daysLeft,
        remainingKm,
        odoDue,
        dateDue,
      },
      reminder.id,
    );

    return {
      due: isDue,
      type: reminder.type,
      nextCounter: lastService.counter + 1,
      summary: {
        odoDue,
        dateDue,
      },

      odo: {
        current: currentOdo,
        lastService: Number(lastService.odoReading),
        nextOdo,
        remainingKm,
      },

      date: {
        lastService: {
          englishDate: lastService.englishDate,
          nepaliDate: lastService.nepaliDate,
        },
        next: {
          englishDate: nextDateEnglish,
          nepaliDate: nextDateNepali,
        },
        daysLeft,
      },
    };
  }

  /**
   * Send service reminder notifications based on urgency and type
   * Reusable function that can be called from multiple places
   */
  async sendServiceReminders(
    user: LoggedInUser,
    reminderData: {
      isDue: boolean;
      daysLeft: number | null;
      remainingKm: number | null;
      odoDue: boolean;
      dateDue: boolean;
    },
    reminderId: string,
  ) {
    const { isDue, daysLeft, remainingKm, odoDue, dateDue } = reminderData;

    // Get the reminder to check cooldowns and disabled status
    const reminder = await this.reminderRepo.findOne({
      where: { id: reminderId },
    });
    if (!reminder || reminder.isDisabled) {
      if (reminder?.isDisabled) {
        console.log(
          `Skipping notification - reminder ${reminderId} is disabled by user`,
        );
      }
      return;
    }

    // Don't send notifications within 1 hour of settings change
    const SETTINGS_GRACE_PERIOD = 1000 * 60 * 60; // 1 hour
    if (
      reminder.settingsUpdatedAt &&
      Date.now() - new Date(reminder.settingsUpdatedAt).getTime() <
        SETTINGS_GRACE_PERIOD
    ) {
      console.log(
        `Skipping notification - reminder settings were recently updated, in grace period`,
      );
      return;
    }

    // Get vehicle details for notification context
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: reminder.vehicleId },
    });
    const vehicleInfo = vehicle
      ? `${vehicle.brand} ${vehicle.model}`
      : 'Your vehicle';

    // Determine notification priority
    let priority = 'low';

    // Overdue notifications
    if (isDue) {
      priority = 'high';
      if (
        this.isInCooldown(
          reminder.lastNotified,
          reminder.lastNotificationPriority,
          priority,
        )
      ) {
        console.log('Skipping overdue notification - still in cooldown');
        return;
      }

      if (odoDue && dateDue) {
        console.log('Sending overdue service notification (both odo and date)');
        await this.notificationService.createAndSend(user, {
          title: `${vehicleInfo} Service Overdue! 🚨`,
          body: `Your ${vehicleInfo.toLowerCase()} service is overdue by both mileage and time. Please schedule service immediately.`,
          type: NotificationTypeENUM.SERVICE_REMINDER,
          vehicleId: reminder.vehicleId,
          meta: {
            priority: 'high',
            type: 'overdue_both',
            odoDue,
            dateDue,
            vehicleInfo,
          },
        });
      } else if (odoDue) {
        console.log('Sending overdue service notification (odo only)');
        await this.notificationService.createAndSend(user, {
          title: `${vehicleInfo} Service Overdue! 🚨`,
          body: `Your ${vehicleInfo.toLowerCase()} service is overdue by mileage. Please schedule service immediately.`,
          type: NotificationTypeENUM.SERVICE_REMINDER,
          vehicleId: reminder.vehicleId,
          meta: {
            priority: 'high',
            type: 'overdue_odo',
            odoDue,
            dateDue,
            vehicleInfo,
          },
        });
      } else if (dateDue) {
        console.log('Sending overdue service notification (date only)');
        await this.notificationService.createAndSend(user, {
          title: `${vehicleInfo} Service Overdue! 🚨`,
          body: `Your ${vehicleInfo.toLowerCase()} service is overdue by time. Please schedule service immediately.`,
          type: NotificationTypeENUM.SERVICE_REMINDER,
          vehicleId: reminder.vehicleId,
          meta: {
            priority: 'high',
            type: 'overdue_date',
            odoDue,
            dateDue,
            vehicleInfo,
          },
        });
      }
    }
    // Upcoming reminders with escalating urgency
    else if (daysLeft !== null) {
      if (daysLeft <= 3) {
        priority = 'high';
        if (
          this.isInCooldown(
            reminder.lastNotified,
            reminder.lastNotificationPriority,
            priority,
          )
        ) {
          console.log('Skipping urgent notification - still in cooldown');
          return;
        }

        console.log(
          'Sending urgent reminder notification, days left:',
          daysLeft,
        );
        await this.notificationService.createAndSend(user, {
          title: `${vehicleInfo} Service Due Soon! ⚠️`,
          body: `Your ${vehicleInfo.toLowerCase()} is due for service in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`,
          type: NotificationTypeENUM.SERVICE_REMINDER,
          vehicleId: reminder.vehicleId,
          meta: {
            priority: 'high',
            type: 'urgent',
            daysLeft,
            odoDue,
            dateDue,
            vehicleInfo,
          },
        });
      } else if (daysLeft <= 7) {
        priority = 'medium';
        if (
          this.isInCooldown(
            reminder.lastNotified,
            reminder.lastNotificationPriority,
            priority,
          )
        ) {
          console.log('Skipping standard notification - still in cooldown');
          return;
        }

        console.log(
          'Sending standard reminder notification, days left:',
          daysLeft,
        );
        await this.notificationService.createAndSend(user, {
          title: `${vehicleInfo} Service Reminder 🚨`,
          body: `Your ${vehicleInfo.toLowerCase()} is due for service in ${daysLeft} days.`,
          type: NotificationTypeENUM.SERVICE_REMINDER,
          vehicleId: reminder.vehicleId,
          meta: {
            priority: 'medium',
            type: 'standard',
            daysLeft,
            odoDue,
            dateDue,
            vehicleInfo,
          },
        });
      } else if (daysLeft <= 14) {
        priority = 'low';
        if (
          this.isInCooldown(
            reminder.lastNotified,
            reminder.lastNotificationPriority,
            priority,
          )
        ) {
          console.log('Skipping planning notification - still in cooldown');
          return;
        }

        console.log(
          'Sending early reminder notification, days left:',
          daysLeft,
        );
        await this.notificationService.createAndSend(user, {
          title: `${vehicleInfo} Service Planning 📅`,
          body: `Your ${vehicleInfo.toLowerCase()} will be due for service in ${daysLeft} days.`,
          type: NotificationTypeENUM.SERVICE_REMINDER,
          vehicleId: reminder.vehicleId,
          meta: {
            priority: 'low',
            type: 'planning',
            daysLeft,
            odoDue,
            dateDue,
            vehicleInfo,
          },
        });
      }
    }
    // Odometer-based alerts
    else if (remainingKm !== null) {
      if (remainingKm <= 100) {
        priority = 'high';
        if (
          this.isInCooldown(
            reminder.lastNotified,
            reminder.lastNotificationPriority,
            priority,
          )
        ) {
          console.log(
            'Skipping critical odometer notification - still in cooldown',
          );
          return;
        }

        console.log(
          'Sending critical odometer reminder, remaining km:',
          remainingKm,
        );
        await this.notificationService.createAndSend(user, {
          title: `${vehicleInfo} Service Due Soon! ⚠️`,
          body: `Your ${vehicleInfo.toLowerCase()} is due for service in ${remainingKm} km.`,
          type: NotificationTypeENUM.SERVICE_REMINDER,
          vehicleId: reminder.vehicleId,
          meta: {
            priority: 'high',
            type: 'odo_urgent',
            remainingKm,
            odoDue,
            dateDue,
            vehicleInfo,
          },
        });
      } else if (remainingKm <= 500) {
        priority = 'medium';
        if (
          this.isInCooldown(
            reminder.lastNotified,
            reminder.lastNotificationPriority,
            priority,
          )
        ) {
          console.log('Skipping odometer notification - still in cooldown');
          return;
        }

        console.log('Sending odometer reminder, remaining km:', remainingKm);
        await this.notificationService.createAndSend(user, {
          title: `${vehicleInfo} Service Planning 📊`,
          body: `Your ${vehicleInfo.toLowerCase()} will be due for service in ${remainingKm} km.`,
          type: NotificationTypeENUM.SERVICE_REMINDER,
          vehicleId: reminder.vehicleId,
          meta: {
            priority: 'medium',
            type: 'odo_standard',
            remainingKm,
            odoDue,
            dateDue,
            vehicleInfo,
          },
        });
      }
    }
    // Update the reminder with last notification info
    await this.reminderRepo.update(reminderId, {
      lastNotified: new Date(),
      lastNotificationPriority: priority,
    });
  }

  async toggleIsDisabled(user: LoggedInUser) {
    const reminder = await this.reminderRepo.findOneOrFail({
      where: {
        userId: user.id,
        vehicleId: user.defaultVehicleId,
      },
    });
    if (user.defaultVehicle.soldEnglishDate)
      return {
        message: `You have already sold this bike.`,
        isDisabled: reminder.isDisabled,
      };
    reminder.isDisabled = !reminder.isDisabled;
    const updated = await this.reminderRepo.save(reminder);

    return {
      message: `Mobile Notification: ${updated.isDisabled ? 'Disabled!' : 'Enabled!'}`,
      id: updated.id,
      isDisabled: updated.isDisabled,
    };
  }

  private isInCooldown(
    lastNotified: Date | undefined,
    lastPriority: string | undefined,
    currentPriority: string,
  ): boolean {
    if (!lastNotified) return false;

    const now = Date.now();
    const lastNotifiedTime = new Date(lastNotified).getTime();
    const diff = now - lastNotifiedTime;

    // Priority-based cooldowns
    const cooldowns = {
      high: 1000 * 60 * 60, // 1 hour
      medium: 1000 * 60 * 60 * 6, // 6 hours
      low: 1000 * 60 * 60 * 24, // 24 hours
    };

    // If current priority is higher than last, allow notification
    const priorityLevels = { high: 3, medium: 2, low: 1 };
    const currentLevel =
      priorityLevels[currentPriority as keyof typeof priorityLevels];
    const lastLevel =
      priorityLevels[lastPriority as keyof typeof priorityLevels] || 0;

    if (currentLevel > lastLevel) return false;

    // Check cooldown for same or lower priority
    const cooldown = cooldowns[currentPriority as keyof typeof cooldowns];
    return diff < cooldown;
  }
}
