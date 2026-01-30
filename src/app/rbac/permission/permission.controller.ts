import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { PermissionService } from './permission.service';

@ApiTags('Permission')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  create(@Body() data: CreatePermissionDto) {
    return this.permissionService.create(data);
  }

  @Get()
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.permissionService.findOne(name);
  }

  @Patch(':name')
  update(@Param('name') name: string, @Body() data: UpdatePermissionDto) {
    return this.permissionService.update(name, data);
  }

  @Delete(':name')
  remove(@Param('name') name: string) {
    return this.permissionService.remove(name);
  }
}
