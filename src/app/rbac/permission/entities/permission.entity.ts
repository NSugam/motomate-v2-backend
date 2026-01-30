import { ApiProperty } from '@nestjs/swagger';
import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { rolePermissionEntity } from '../../entities/rolePermission.entity';

@Entity({ name: 'permissionTable' })
export class permissionEntity {
  @ApiProperty({ example: 'get' })
  @PrimaryColumn({ type: 'varchar' })
  name: string;

  @OneToMany(
    () => rolePermissionEntity,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: rolePermissionEntity[];
}
