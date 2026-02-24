import { MediaTypeEnum } from '../../../src/common/common.enum';
import { Column, Entity } from 'typeorm';
import { CommonFields } from '../../../src/common/base.entity';

@Entity('t_media')
export class Media extends CommonFields {
  @Column({ type: 'enum', enum: MediaTypeEnum, name: 'media_type' })
  type: MediaTypeEnum;

  @Column({ type: 'varchar', length: 300, name: 'url' })
  url: string;
}
