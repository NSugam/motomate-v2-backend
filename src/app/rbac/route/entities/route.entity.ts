import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { rolePermissionEntity } from '../../entities/rolePermission.entity';

@Entity({ name: 'routesTable' })
export class routesEntity {
  @PrimaryColumn({ type: 'varchar' })
  name: string;

  @OneToMany(
    () => rolePermissionEntity,
    (rolePermission) => rolePermission.route,
  )
  rolePermissions: rolePermissionEntity[];
}
