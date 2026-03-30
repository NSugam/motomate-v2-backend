import { PartsChanged } from 'src/app/parts-changed/entities/parts-changed.entity';
import { PartsReminder } from 'src/app/parts-reminder/entities/parts-reminder.entity';
import { CommonFields } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

@Entity('md_part')
export class Part extends CommonFields {
  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => PartsChanged, (partsChanged) => partsChanged.part)
  partsChangedRecords: PartsChanged[];

  @OneToOne(() => PartsReminder, (reminder) => reminder.part, {
    cascade: true,
    nullable: true,
  })
  @JoinColumn()
  partReminder: PartsReminder;
}
