import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FailOnFoundFn,
  FindAndCountFn,
  FindManyFn,
  FindOneFn,
  FindOrFailFn,
} from 'src/common/orm.type';
import { generateTakeSkip } from 'src/helper/utils';
import { Repository } from 'typeorm';
import { CreateRoleDTO, UpdateRoleDTO } from './dto/role.dto';
import { roleEntity } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(roleEntity)
    private readonly roleRepo: Repository<roleEntity>,
  ) {}

  async create(body: CreateRoleDTO) {
    await this.roleRepo.save(this.roleRepo.create({ ...body }));
    return { message: 'Role Created Successfully' };
  }

  findOne: FindOneFn<roleEntity> = (where, select, relations) =>
    this.roleRepo.findOne({ where, select, relations });

  findOrFail: FindOrFailFn<roleEntity> = (where, select, relations) =>
    this.roleRepo.findOneOrFail({ where, select, relations });

  failOnFound: FailOnFoundFn<roleEntity> = async (where, relations) => {
    const data = await this.findOne(where, ['name'], relations);
    if (data) throw new Error(`Role Already Exists With Name ${data.name}`);
  };

  findMany: FindManyFn<roleEntity> = (w, s, o, r) =>
    this.roleRepo.find({ where: w, select: s, relations: r, order: o });

  findAndCount: FindAndCountFn<roleEntity> = (w, s, p, o, r) => {
    const { take, skip } = generateTakeSkip(p);
    return this.roleRepo.findAndCount({
      where: w,
      select: s,
      relations: r,
      order: o,
      take,
      skip,
    });
  };

  async update(name: string, payload: UpdateRoleDTO) {
    const data = await this.findOrFail({ name }, []);
    const updated = this.roleRepo.merge(data, payload);
    await this.roleRepo.update(name, updated);
    return { message: 'Role Updated Successfully' };
  }

  async delete(name: string) {
    await this.findOrFail({ name }, []);
    await this.roleRepo.softDelete(name);
    return { message: 'Role Deleted Successfully' };
  }
}
