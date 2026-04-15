import { CommonFields } from 'src/common/base.entity';
import { Column, Entity } from 'typeorm';
import { UploadFormatENUM, UploadTypeENUM } from '../upload.type';

@Entity('uploads')
export class Upload extends CommonFields {
  @Column({ nullable: true })
  fileName: string;

  @Column()
  url: string;

  @Column()
  publicId: string;

  @Column({
    type: 'enum',
    enum: UploadTypeENUM,
    nullable: true,
  })
  type: UploadTypeENUM;

  @Column({
    type: 'enum',
    enum: UploadFormatENUM,
    nullable: true,
  })
  format: UploadFormatENUM;
}
