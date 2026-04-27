import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserDevice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  expoToken: string;

  @ManyToOne(() => User, (user) => user.devices, {
    onDelete: 'CASCADE',
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
