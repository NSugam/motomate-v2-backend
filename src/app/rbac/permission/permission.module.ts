import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { permissionEntity } from './entities/permission.entity';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';

@Module({
  imports: [TypeOrmModule.forFeature([permissionEntity])],
  controllers: [PermissionController],
  providers: [PermissionService],
})
export class PermissionModule {}
