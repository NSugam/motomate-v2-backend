import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationModule } from '../notification/notification.module';
import { Servicing } from '../servicing/entities/servicing.entity';
import { User } from '../user/entities/user.entity';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { ServiceReminder } from './entities/service-reminder.entity';
import { ServiceReminderController } from './service-reminder.controller';
import { ServiceReminderCronService } from './service-reminder.cron.service';
import { ServiceReminderService } from './service-reminder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ServiceReminder,
      Vehicle,
      Servicing,
      User,
      ServiceReminder,
    ]),
    NotificationModule,
  ],
  controllers: [ServiceReminderController],
  providers: [ServiceReminderService, ServiceReminderCronService],
})
export class ServiceReminderModule {}
