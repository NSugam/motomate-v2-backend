import NepaliDate from 'nepali-date-converter';
import { User } from 'src/app/user/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('vehicle')
export class Vehicle {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.vehicles)
  user: User;

  @Column({ type: 'text' })
  brand: string;

  @Column({ type: 'text' })
  model: string;

  @Column({ type: 'int' })
  cc: number;

  @Column({ type: 'bigint' })
  odoReading: number;

  @Column({ type: 'text' })
  year: string;

  @Column({ type: 'float', default: 0 })
  afe: number;

  @Column({ type: 'date', nullable: true })
  englishDate: string;

  @Column({ nullable: true })
  nepaliDate: string;

  @BeforeInsert()
  @BeforeUpdate()
  syncNepaliDate() {
    if (!this.englishDate) return;
    const nepali = new NepaliDate(new Date(this.englishDate));
    this.nepaliDate = nepali.format('YYYY MMMM DD', 'np');
  }
}
