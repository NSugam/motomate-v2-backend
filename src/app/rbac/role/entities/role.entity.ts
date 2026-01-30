import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { rolePermissionEntity } from '../../entities/rolePermission.entity';

@Entity({ name: 'rolesTable' })
export class roleEntity {
  @PrimaryColumn({ type: 'varchar' })
  name: string;

  @OneToMany(
    () => rolePermissionEntity,
    (rolePermission) => rolePermission.role,
  )
  rolePermissions: rolePermissionEntity[];
}
