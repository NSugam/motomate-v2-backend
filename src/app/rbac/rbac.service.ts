import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LoggedInUser } from '../user/user.type';
import { RbacDto } from './dto/rbac.dto';
import { rolePermissionEntity } from './entities/rolePermission.entity';
import { permissionEntity } from './permission/entities/permission.entity';
import { roleEntity } from './role/entities/role.entity';
import { routesEntity } from './route/entities/route.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(rolePermissionEntity)
    private readonly rolePermissionEntity: Repository<rolePermissionEntity>,

    @InjectRepository(roleEntity)
    private readonly roleEntity: Repository<roleEntity>,

    @InjectRepository(routesEntity)
    private readonly routeEntity: Repository<routesEntity>,

    @InjectRepository(permissionEntity)
    private readonly permissionEntity: Repository<permissionEntity>,

    private readonly dataSource: DataSource,
  ) {}

  async create(body: RbacDto) {
    // Check if role exists
    const hasRole = await this.roleEntity.findOne({
      where: { name: body.role },
    });
    if (!hasRole) throw new Error('Role does not exist');

    // Check if route exists
    const hasRoute = await this.routeEntity.findOne({
      where: { name: body.route },
    });
    if (!hasRoute) throw new Error('Route does not exist');

    // Check if permission exists
    const hasPermission = await this.permissionEntity.findOne({
      where: { name: body.permission },
    });
    if (!hasPermission) throw new Error('Permission does not exist');

    // CHeck if role-permission already exists
    const data = await this.rolePermissionEntity.findOne({
      where: {
        role: { name: body.role },
        route: { name: body.route },
        permission: { name: body.permission },
      },
    });
    if (data) throw new Error('Role-Permission already exists');

    const newRolePermission = this.rolePermissionEntity.create({
      role: { name: body.role },
      route: { name: body.route },
      permission: { name: body.permission },
    });

    await this.rolePermissionEntity.save(newRolePermission);
    return { message: 'New Permission Created' };
  }

  async replaceAll(items: RbacDto[]) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Validate payload first
      for (const item of items) {
        const role = await manager.findOne(roleEntity, {
          where: { name: item.role },
        });
        if (!role) throw new Error(`Role not found: ${item.role}`);

        const route = await manager.findOne(routesEntity, {
          where: { name: item.route },
        });
        if (!route) throw new Error(`Route not found: ${item.route}`);

        const permission = await manager.findOne(permissionEntity, {
          where: { name: item.permission },
        });
        if (!permission)
          throw new Error(`Permission not found: ${item.permission}`);
      }

      // 2. Clear table (inside transaction)
      await manager.clear(rolePermissionEntity);

      // 3. Insert new data
      const records = items.map((item) =>
        manager.create(rolePermissionEntity, {
          role: { name: item.role },
          route: { name: item.route },
          permission: { name: item.permission },
        }),
      );

      await manager.save(rolePermissionEntity, records);

      return {
        message: 'RBAC permissions updated successfully',
      };
    });
  }

  async my(user: LoggedInUser) {
    try {
      const rbac = await this.rolePermissionEntity.find({
        where: {
          role: { name: user.role },
        },
        relations: ['role', 'route', 'permission'],
        order: {
          route: {
            name: 'ASC',
          },
        },
      });

      const formattedPermissions = rbac.map((data) => ({
        id: data.id,
        role: data.role?.name,
        route: data.route?.name,
        permission: data.permission?.name,
      }));

      return {
        message: 'All role-permission records',
        success: true,
        statusCode: HttpStatus.OK,
        data: formattedPermissions,
      };
    } catch {
      return {
        message: 'Internal Server Error',
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async findAll(query: RbacDto) {
    const { role, route, permission } = query;

    try {
      const rbac = await this.rolePermissionEntity.find({
        where: {
          role: { name: role },
          route: { name: route },
          permission: { name: permission },
        },
        relations: ['role', 'route', 'permission'],
        order: {
          route: {
            name: 'ASC',
          },
        },
      });

      const formattedPermissions = rbac.map((data) => ({
        id: data.id,
        role: data.role?.name,
        route: data.route?.name,
        permission: data.permission?.name,
      }));

      return {
        message: 'All role-permission records',
        success: true,
        statusCode: HttpStatus.OK,
        data: formattedPermissions,
      };
    } catch {
      return {
        message: 'Internal Server Error',
        success: false,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async bulkDelete(ids: string[]) {
    if (!ids.length) {
      return { message: 'No RBAC ids provided' };
    }

    const count = await this.rolePermissionEntity.count({
      where: ids.map((id) => ({ id })),
    });

    if (count !== ids.length) {
      throw new Error('One or more RBAC records not found');
    }

    await this.rolePermissionEntity.delete(ids);

    return { message: 'RBAC Deleted Successfully' };
  }
}
