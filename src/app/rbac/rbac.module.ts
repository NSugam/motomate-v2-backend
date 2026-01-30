import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { rolePermissionEntity } from './entities/rolePermission.entity';
import { permissionEntity } from './permission/entities/permission.entity';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { roleEntity } from './role/entities/role.entity';
import { routesEntity } from './route/entities/route.entity';

@Module({
  imports: [
    CacheModule.register(),
    TypeOrmModule.forFeature([
      permissionEntity,
      roleEntity,
      routesEntity,
      rolePermissionEntity,
    ]),
    WinstonModule,
  ],
  controllers: [RbacController],
  providers: [RbacService],
})
export class RbacModule {}
