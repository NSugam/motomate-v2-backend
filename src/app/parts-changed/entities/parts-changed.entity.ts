import { Servicing } from 'src/app/servicing/entities/servicing.entity';
import { CommonFields } from 'src/common/base.entity';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity()
export class PartsChanged extends CommonFields {
  @ManyToMany(() => Servicing, (servicing) => servicing.partsChanged)
  servicing: Servicing[];

  @Column({ type: 'text' })
  partName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;
}
