import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

import { Vehicle } from 'src/app/vehicle/entities/vehicle.entity';
import { User } from 'src/app/user/entities/user.entity';

export enum SharedVehiclePermissionENUM {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
}

export enum SharedVehicleStatusENUM {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity('shared_vehicle')
export class SharedVehicle {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @Column({ type: 'bigint' })
  vehicleId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sharedWithUserId' })
  sharedWith: User;

  @Column({ type: 'bigint' })
  sharedWithUserId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sharedByUserId' })
  sharedBy: User;

  @Column({ type: 'bigint' })
  sharedByUserId: string;

  @Column({
    type: 'enum',
    enum: SharedVehiclePermissionENUM,
    default: SharedVehiclePermissionENUM.VIEW,
  })
  permission: SharedVehiclePermissionENUM;

  @Column({
    type: 'enum',
    enum: SharedVehicleStatusENUM,
    default: SharedVehicleStatusENUM.PENDING,
  })
  status: SharedVehicleStatusENUM;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
