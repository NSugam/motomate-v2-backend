import { CommonFields } from 'src/common/base.entity';
import { Column, Entity } from 'typeorm';
import { ReminderTypeENUM } from '../dto/reminder.types';

@Entity('service_reminder')
export class ServiceReminder extends CommonFields {
  @Column({
    type: 'enum',
    enum: ReminderTypeENUM,
    default: ReminderTypeENUM.BOTH,
  })
  type: ReminderTypeENUM;

  @Column({ type: 'int', default: 2000 })
  odoInterval?: number;

  @Column({ type: 'int', default: 30 })
  dateInterval?: number;
}
