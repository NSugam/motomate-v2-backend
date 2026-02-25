import NepaliDate from 'nepali-date-converter';
import { PartsChanged } from 'src/app/parts-changed/entities/parts-changed.entity';
import { CommonFields } from 'src/common/base.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';

@Entity('servicing')
export class Servicing extends CommonFields {
  @Column()
  location: string;

  @Column({ type: 'int' })
  counter: number;

  @Column({ type: 'bigint' })
  odoReading: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @Column({ type: 'date' })
  englishDate: string;

  @Column()
  nepaliDate: string;

  @OneToMany(() => PartsChanged, (partsChanged) => partsChanged.servicing, {
    cascade: true,
  })
  partsChanged: PartsChanged[];

  @Column({ nullable: true })
  remarks: string;

  @BeforeInsert()
  @BeforeUpdate()
  syncNepaliDate() {
    if (!this.englishDate) return;
    const nepali = new NepaliDate(new Date(this.englishDate));
    this.nepaliDate = nepali.format('YYYY MMMM DD', 'np');
  }
}
