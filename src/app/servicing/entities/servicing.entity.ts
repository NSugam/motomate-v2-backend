import { PartsChanged } from 'src/app/parts-changed/entities/parts-changed.entity';
import { Vehicle } from 'src/app/vehicle/entities/vehicle.entity';
import { CommonFields } from 'src/common/base.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

@Entity('servicing')
export class Servicing extends CommonFields {
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.servicing)
  vehicle: Vehicle;

  @Column()
  location: string;

  @Column({ type: 'int' })
  counter: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @Column({ type: 'date' })
  englishDate: string;

  @Column()
  nepaliDate: string;

  @Column({ type: 'bigint' })
  odoReading: number;

  @ManyToMany(() => PartsChanged, (part) => part.servicing, {
    onDelete: 'SET NULL',
  })
  @JoinTable({
    // join table name
    name: 'servicing_parts_changed',
    joinColumn: {
      name: 'servicing_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'parts_changed_id',
      referencedColumnName: 'id',
    },
  })
  partsChanged: PartsChanged[];

  @Column({ nullable: true })
  remarks: string;
}
