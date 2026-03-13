import NepaliDate from 'nepali-date-converter';
import { CommonFields } from 'src/common/base.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';

@Entity()
export class Fillups extends CommonFields {
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  odoReading: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fuelCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  mileage: number;

  @Column({ type: 'date', nullable: true })
  englishDate: string;

  @Column({ nullable: true })
  nepaliDate: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'boolean', default: false })
  isPartial: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  syncNepaliDate() {
    if (!this.englishDate) return;
    const nepali = new NepaliDate(new Date(this.englishDate));
    this.nepaliDate = nepali.format('YYYY MMMM DD', 'np');
  }
}
