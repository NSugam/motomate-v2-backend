import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateTakeSkip } from 'src/helper/utils';
import { FindAndCountFn, FindOrFailFn, FindOneFn } from 'src/common/orm.type';
import { VersionControl } from './entities/version-control.entity';
import {
  CreateVersionControlDTO,
  UpdateVersionControlDTO,
} from './dto/version-control.dto';

@Injectable()
export class VersionControlService {
  constructor(
    @InjectRepository(VersionControl)
    private readonly repo: Repository<VersionControl>,
  ) {}

  async create(payload: CreateVersionControlDTO) {
    const data = this.repo.create(payload);
    const saved = await this.repo.save(data);
    return { message: 'Version Control Added Successfully', id: saved.id };
  }

  findOne: FindOneFn<VersionControl> = (where, select, relations) => {
    return this.repo.findOne({ where, select, relations });
  };

  async findLatest() {
    const [latest] = await this.repo.find({
      order: { createdAt: 'DESC' },
      take: 1,
    });
    return latest;
  }

  findOrFail: FindOrFailFn<VersionControl> = async (
    where,
    select = [],
    relations = [],
  ) => {
    return this.repo.findOneOrFail({ where, select, relations });
  };

  findAndCount: FindAndCountFn<VersionControl> = (w, s, p, o, r) => {
    const { take, skip } = generateTakeSkip(p);
    return this.repo.findAndCount({
      where: w,
      select: s,
      relations: r,
      order: o,
      take,
      skip,
    });
  };

  async update(id: string, payload: UpdateVersionControlDTO) {
    const data = await this.findOrFail({ id });

    Object.assign(data, payload);

    await this.repo.save(data);
    return { message: 'Version Control Updated Successfully' };
  }

  async delete(id: string) {
    const entity = await this.findOrFail({ id });
    await this.repo.remove(entity);
    return { message: 'Version Control Deleted Successfully' };
  }
}
