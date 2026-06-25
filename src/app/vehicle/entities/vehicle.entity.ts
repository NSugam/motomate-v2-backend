import NepaliDate from 'nepali-date-converter';
import { Upload } from 'src/app/upload/entities/upload.entity';
import { User } from 'src/app/user/entities/user.entity';
import { MasterData } from 'src/master-data/entities/md_bikes.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
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

  @ManyToOne(() => User, (user) => user.vehicles, {
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToOne(() => Upload, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'vehicleImageId' })
  vehicleImage: Upload;

  @ManyToOne(() => MasterData, (data) => data.userVehicle, {
    nullable: true,
  })
  masterData: MasterData;

  @Column({ type: 'text' })
  brand: string;

  @Column({ type: 'text' })
  model: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  licensePlate?: string;

  @Column({ type: 'float' })
  cc: number;

  @Column({ type: 'bigint' })
  odoReading: number;

  @Column({ type: 'text' })
  year: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    nullable: true,
  })
  afe: number;

  @Column({ type: 'date', nullable: true })
  englishDate: string;
  @Column({ nullable: true })
  nepaliDate: string;

  @Column({ type: 'date', nullable: true })
  soldEnglishDate: string;
  @Column({ nullable: true })
  soldNepaliDate: string;

  @BeforeInsert()
  @BeforeUpdate()
  syncNepaliDate() {
    if (!this.englishDate) return;
    const nepali = new NepaliDate(new Date(this.englishDate));
    this.nepaliDate = nepali.format('YYYY MMMM DD', 'np');

    if (!this.soldEnglishDate) return;
    const soldNepali = new NepaliDate(new Date(this.soldEnglishDate));
    this.soldNepaliDate = soldNepali.format('YYYY MMMM DD', 'np');
  }
}
