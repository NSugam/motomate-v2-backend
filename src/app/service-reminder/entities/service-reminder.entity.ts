import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ReminderTypeENUM } from '../dto/reminder.types';

@Entity('service_reminder')
export class ServiceReminder {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint' })
  userId: string;

  @Column({ type: 'bigint', unique: true })
  vehicleId: string;

  @Column({
    type: 'enum',
    enum: ReminderTypeENUM,
    default: ReminderTypeENUM.BOTH,
  })
  type: ReminderTypeENUM;

  @Column({ type: 'int', default: 10000, nullable: true })
  odoInterval?: number;

  @Column({ type: 'int', default: 30, nullable: true })
  dateInterval?: number;

  @Column({ type: 'timestamp', nullable: true })
  lastNotified?: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  lastNotificationPriority?: string;

  @Column({ type: 'timestamp', nullable: true })
  settingsUpdatedAt?: Date;

  @Column({ type: 'boolean', default: false })
  isDisabled: boolean = false;
}
