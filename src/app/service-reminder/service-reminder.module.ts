import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceReminder } from './entities/service-reminder.entity';
import { ServiceReminderController } from './service-reminder.controller';
import { ServiceReminderService } from './service-reminder.service';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { Servicing } from '../servicing/entities/servicing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceReminder, Vehicle, Servicing])],
  controllers: [ServiceReminderController],
  providers: [ServiceReminderService],
})
export class ServiceReminderModule {}
