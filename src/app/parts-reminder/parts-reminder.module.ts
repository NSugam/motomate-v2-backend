import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Part } from '../part/entities/part.entity';
import { PartsReminder } from './entities/parts-reminder.entity';
import { PartsReminderController } from './parts-reminder.controller';
import { PartsReminderService } from './parts-reminder.service';

@Module({
  imports: [TypeOrmModule.forFeature([PartsReminder, Part])],
  controllers: [PartsReminderController],
  providers: [PartsReminderService],
})
export class PartsReminderModule {}
