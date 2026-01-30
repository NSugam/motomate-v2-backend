import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { permissionEntity } from './entities/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(permissionEntity)
    private readonly permissionRepo: Repository<permissionEntity>,
  ) {}

  async create(data: CreatePermissionDto) {
    const exists = await this.permissionRepo.findOne({
      where: { name: data.name },
    });
    if (exists) throw new NotFoundException('Permission already exists');
    return await this.permissionRepo.save(
      this.permissionRepo.create({ ...data }),
    );
  }

  async findAll() {
    return await this.permissionRepo.findBy({});
  }

  async findOne(name: string) {
    const permission = await this.permissionRepo.findOne({
      where: { name },
    });
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async update(name: string, data: UpdatePermissionDto) {
    const permission = await this.findOne(name);
    Object.assign(permission, data);
    return await this.permissionRepo.save(permission);
  }

  async remove(name: string) {
    const permission = await this.findOne(name);
    return await this.permissionRepo.remove(permission);
  }
}
