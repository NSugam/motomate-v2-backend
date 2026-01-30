import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { permissionEntity } from '../permission/entities/permission.entity';
import { roleEntity } from '../role/entities/role.entity';
import { routesEntity } from '../route/entities/route.entity';

@Entity({ name: 'rolePermission' })
export class rolePermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  restaurantId: string;

  @ManyToOne(() => roleEntity, (role) => role.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roles' })
  role: roleEntity;

  @ManyToOne(() => routesEntity, (route) => route.rolePermissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'routes' })
  route: routesEntity;

  @ManyToOne(
    () => permissionEntity,
    (permission) => permission.rolePermissions,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'permission' })
  permission: permissionEntity;
}
