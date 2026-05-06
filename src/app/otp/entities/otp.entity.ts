import { User } from 'src/app/user/entities/user.entity';
import { otpTypeENUM } from 'src/common/common.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class OTP {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text' })
  otpCode: string;

  @Column({
    type: 'enum',
    enum: otpTypeENUM,
  })
  type: otpTypeENUM;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ type: 'timestamptz' })
  expiryTime: Date;

  @Column({ default: 3 })
  attemptsRemaining: number;
}
