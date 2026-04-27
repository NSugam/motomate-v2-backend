import { CommonFields } from 'src/common/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { NotificationTypeENUM } from '../dto/create-notification.dto';

@Entity('notifications')
export class Notification extends CommonFields {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({
    type: 'enum',
    enum: NotificationTypeENUM,
  })
  type: NotificationTypeENUM;

  @Column({ type: 'json', nullable: true })
  meta: Record<string, any>;
}
