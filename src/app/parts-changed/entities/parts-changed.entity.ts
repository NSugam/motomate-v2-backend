import NepaliDate from 'nepali-date-converter';
import { Part } from 'src/app/part/entities/part.entity';
import { Servicing } from 'src/app/servicing/entities/servicing.entity';
import { CommonFields } from 'src/common/base.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class PartsChanged extends CommonFields {
  @ManyToOne(() => Servicing, (servicing) => servicing.partsChanged, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  servicing: Servicing;

  @ManyToOne(() => Part, (part) => part.partsChangedRecords, {
    onDelete: 'CASCADE',
  })
  part: Part;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'bigint', nullable: true })
  odoReading: number;

  @Column({ type: 'date', nullable: true })
  englishDate: string;

  @Column({ nullable: true })
  nepaliDate: string;

  @Column({ type: 'boolean', default: false })
  fromServicing: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  syncNepaliDate() {
    if (!this.englishDate) return;
    const nepali = new NepaliDate(new Date(this.englishDate));
    this.nepaliDate = nepali.format('YYYY MMMM DD', 'np');
    this.fromServicing = !!this.servicing;
  }
}
