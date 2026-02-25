import { Part } from 'src/app/part/entities/part.entity';
import { CommonFields } from 'src/common/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { ReminderTypeENUM } from '../dto/reminder.types';

@Entity('parts_reminder')
export class PartsReminder extends CommonFields {
  @OneToOne(() => Part, (part) => part.partReminder, { onDelete: 'SET NULL' })
  part: Part;

  @Column({ type: 'enum', enum: ReminderTypeENUM })
  type: ReminderTypeENUM;

  @Column({ type: 'int', nullable: true })
  odoInterval?: number;

  @Column({ type: 'int', nullable: true })
  dateInterval?: number;
}
