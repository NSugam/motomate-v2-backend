import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class VersionControl {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column()
  app: string;

  @Column()
  buildType: string;

  @Column()
  version: string;

  @Column()
  versionCode: string;

  @Column({ nullable: true })
  remarks: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
