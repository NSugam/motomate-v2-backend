import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceReminder } from 'src/app/service-reminder/entities/service-reminder.entity';
import { ServiceReminderService } from 'src/app/service-reminder/service-reminder.service';
import { User } from 'src/app/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Vehicle } from '../vehicle/entities/vehicle.entity';

@Injectable()
export class ServiceReminderCronService {
  private readonly logger = new Logger(ServiceReminderCronService.name);

  constructor(
    private readonly serviceReminderService: ServiceReminderService,

    @InjectRepository(ServiceReminder)
    private readonly reminderRepo: Repository<ServiceReminder>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
  ) {}

  @Cron('0 */2 * * *')
  async handleCron() {
    const startTime = Date.now();
    this.logger.log('Starting service reminder cron job');

    try {
      const reminders = await this.reminderRepo.find();

      if (!reminders.length) {
        this.logger.log('No service reminders found');
        return;
      }

      this.logger.log(`Processing ${reminders.length} service reminders`);

      // Process reminders in parallel batches
      const batchSize = 10;
      const results = [];

      for (let i = 0; i < reminders.length; i += batchSize) {
        const batch = reminders.slice(i, i + batchSize);
        const batchResults = await Promise.allSettled(
          batch.map((reminder) => this.processReminder(reminder)),
        );
        results.push(...batchResults);

        // Add small delay between batches to prevent overwhelming
        if (i + batchSize < reminders.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      const duration = Date.now() - startTime;
      this.logger.log(
        `Cron job completed in ${duration}ms. Success: ${successful}, Failed: ${failed}`,
      );

      if (failed > 0) {
        this.logger.warn(`${failed} reminders failed to process`);
      }
    } catch (error) {
      this.logger.error('Cron job failed', error);
      throw error;
    }
  }

  private async processReminder(reminder: ServiceReminder) {
    try {
      const user = await this.userRepo.findOne({
        where: { id: reminder.userId },
        relations: ['devices', 'vehicles'],
      });
      const vehicle = await this.vehicleRepo.findOne({
        where: { id: reminder.vehicleId },
      });

      if (!user || !vehicle) {
        this.logger.warn(
          `Missing user or vehicle data for reminder ${reminder.id}`,
        );
        return;
      }

      await this.serviceReminderService.getDueReminder(user, {
        userId: reminder.userId,
        vehicleId: reminder.vehicleId,
        currentOdo: vehicle.odoReading,
      });

      this.logger.debug(`Successfully processed reminder for user ${user.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to process reminder ${reminder.id} for user ${reminder.userId}`,
        error,
      );
      throw error;
    }
  }
}
