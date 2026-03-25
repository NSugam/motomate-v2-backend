import { Vehicle } from 'src/app/vehicle/entities/vehicle.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('md_bikes')
export class MasterData {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column()
  make: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  year: string;

  @Column({ nullable: true })
  engine: string;

  @Column({ nullable: true })
  displacement: string;

  @Column({ nullable: true })
  power: string;

  @Column({ nullable: true })
  torque: string;

  @Column({ nullable: true })
  cooling: string;

  @Column({ nullable: true })
  total_weight: string;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.masterData)
  userVehicle: Vehicle[];
}
