import { Column, Entity, OneToMany } from 'typeorm';
import { CommonFields } from 'src/common/base.entity';
import { PartsChanged } from 'src/app/parts-changed/entities/parts-changed.entity';

@Entity('part')
export class Part extends CommonFields {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => PartsChanged, (partsChanged) => partsChanged.part)
  partsChangedRecords: PartsChanged[];
}
