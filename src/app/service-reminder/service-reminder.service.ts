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

    if (!data) {
      data = this.reminderRepo.create({
        userId: user.id,
        vehicleId: user.defaultVehicleId,
      });
    }

    // Update type first
    if (payload.type) {
      data.type = payload.type;
    }

    const finalType = payload.type ?? data.type;

    if (finalType === ReminderTypeENUM.BOTH) {
      if (payload.odoInterval !== undefined) {
        data.odoInterval = payload.odoInterval;
      }
      if (payload.dateInterval !== undefined) {
        data.dateInterval = payload.dateInterval;
      }
    }

    if (finalType === ReminderTypeENUM.ODO) {
      if (payload.odoInterval !== undefined) {
        data.odoInterval = payload.odoInterval;
      }
      data.dateInterval = null;
    }

    if (finalType === ReminderTypeENUM.DATE) {
      if (payload.dateInterval !== undefined) {
        data.dateInterval = payload.dateInterval;
      }
      data.odoInterval = null;
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
        remainingKm = nextOdo - currentOdo;
        odoDue = currentOdo >= nextOdo;
      }
    }

    /* ================= DATE ================= */
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

        // remove time for accurate day diff
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

    if (daysLeft !== null && daysLeft <= 7 && !isDue) {
      console.log('Sending reminder notification, days left:', daysLeft);
      await this.notificationService.createAndSend(user, {
        title: 'Service Reminder 🚨',
        body: `Your vehicle is due for service in ${daysLeft} days.`,
        type: NotificationTypeENUM.SERVICE_REMINDER,
      });
    }

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
}
