import { Servicing } from 'src/app/servicing/entities/servicing.entity';
import { User } from 'src/app/user/entities/user.entity';
import { CommonFields } from 'src/common/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('vehicles')
export class Vehicle extends CommonFields {
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

  @Column({ type: 'text' })
  nepaliDate: string;

  @Column({ type: 'date' })
  englishDate: string;

  @OneToMany(() => Servicing, (servicing) => servicing.vehicle)
  servicing: Servicing[];
}
