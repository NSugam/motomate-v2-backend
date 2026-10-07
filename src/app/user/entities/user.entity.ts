import { Vehicle } from 'src/app/vehicle/entities/vehicle.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRoleENUM } from '../user.type';
import { UserDevice } from './user.device.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'bigint', name: 'defaultVehicleId', nullable: true })
  defaultVehicleId: string;

  @ManyToOne(() => Vehicle, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'defaultVehicleId' })
  defaultVehicle: Vehicle;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true,
  })
  deletedAt?: Date;

  @Column({ type: 'text' })
  fullname: string;

  @Column({ type: 'text', unique: true })
  username: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  jiraEmail: string;

  @Column({ type: 'text', nullable: true, unique: true })
  phone: string;

  @Column({ type: 'boolean', default: true })
  verified: boolean;

  @Column({ type: 'boolean', default: false })
  phoneVerified: boolean;

  @Column({ type: 'text' })
  password: string;

  @OneToMany(() => UserDevice, (device) => device.user)
  devices: UserDevice[];

  @Column({
    type: 'enum',
    enum: UserRoleENUM,
    default: UserRoleENUM.USER,
  })
  role: UserRoleENUM;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.user, {
    cascade: false,
  })
  vehicles: Vehicle[];
}
