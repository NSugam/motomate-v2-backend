import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { roleEntity } from './entities/role.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [TypeOrmModule.forFeature([roleEntity])],
  controllers: [RoleController],
  providers: [RoleService],
})
export class RoleModule {}
