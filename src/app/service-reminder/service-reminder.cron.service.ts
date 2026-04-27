import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceReminder } from 'src/app/service-reminder/entities/service-reminder.entity';
import { ServiceReminderService } from 'src/app/service-reminder/service-reminder.service';
import { User } from 'src/app/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Vehicle } from '../vehicle/entities/vehicle.entity';

@Injectable()
export class ServiceReminderCronService {
  constructor(
    private readonly serviceReminderService: ServiceReminderService,

    @InjectRepository(ServiceReminder)
    private readonly reminderRepo: Repository<ServiceReminder>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
  ) {}

  @Cron('0 0 */24 * * *')
  async handleCron() {
    const reminders = await this.reminderRepo.find();

    for (const reminder of reminders) {
      try {
        const user = await this.userRepo.findOne({
          where: { id: reminder.userId },
          relations: ['devices', 'vehicles'],
        });
        const vehicle = await this.vehicleRepo.findOne({
          where: { id: reminder.vehicleId },
        });

        if (!user || !vehicle) continue;

        await this.serviceReminderService.getDueReminder(user, {
          userId: reminder.userId,
          vehicleId: reminder.vehicleId,
          currentOdo: vehicle.odoReading,
        });
      } catch (err) {
        console.error('Cron error:', err);
      }
    }
  }
}
