import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { IdDTO, optionalPagiSearchTermDTO } from 'src/common/dto';
import { OrmWhereType } from 'src/common/orm.type';
import { ILike } from 'typeorm';
import { CreateRoleDTO, UpdateRoleDTO } from './dto/role.dto';
import { roleEntity } from './entities/role.entity';
import { RoleService } from './role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  findAll(@Query() { searchTerm, ...query }: optionalPagiSearchTermDTO) {
    const filter: OrmWhereType<roleEntity> = {};
    if (searchTerm) filter.name = ILike(`%${searchTerm}%`);

    return this.roleService.findAndCount(filter, [], query, { name: 'ASC' });
  }

  @Get(':id')
  findOne(@Param() { id }: IdDTO) {
    return this.roleService.findOne({ name: id }, ['rolePermissions']);
  }

  @Post()
  create(@Body() body: CreateRoleDTO) {
    return this.roleService.create(body);
  }

  @Patch(':id')
  update(@Body() body: UpdateRoleDTO, @Param() { id }: IdDTO) {
    return this.roleService.update(id, body);
  }

  @Delete(':id')
  delete(@Param() { id }: IdDTO) {
    return this.roleService.delete(id);
  }
}
