import { BadRequestException, Injectable } from '@nestjs/common';
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

import { LoggedInUser } from '../user/user.type';
import {
  CreatePartsChangedDTO,
  UpdatePartsChangedDTO,
} from './dto/parts-changed.dto';
import { PartsChanged } from './entities/parts-changed.entity';

@Injectable()
export class PartsChangedService {
  constructor(
    @InjectRepository(PartsChanged)
    private readonly partsChangedRepo: Repository<PartsChanged>,
  ) {}

  async create(payload: CreatePartsChangedDTO, user: LoggedInUser) {
    const data = this.partsChangedRepo.create({ userId: user.id, ...payload });
    const part = await this.partsChangedRepo.save(data);
    return { message: 'Part Added Successfully', id: part.id };
  }

  findOne: FindOneFn<PartsChanged> = (where, select, relations) => {
    return this.partsChangedRepo.findOne({ where, select, relations });
  };

  findOrFail: FindOrFailFn<PartsChanged> = async (where, select, relations) => {
    return this.partsChangedRepo.findOneOrFail({ where, select, relations });
  };

  failOnFound: FailOnFoundFn<PartsChanged> = async (where, relations) => {
    const data = await this.findOne(where, ['id'], relations);
    if (data) {
      throw new BadRequestException([`Part Already Exists With Id ${data.id}`]);
    }
  };

  findMany: FindManyFn<PartsChanged> = (w, s, o, r) => {
    return this.partsChangedRepo.find({
      where: w,
      select: s,
      relations: r,
      order: o,
    });
  };

  findAndCount: FindAndCountFn<PartsChanged> = (w, s, p, o, r) => {
    const { take, skip } = generateTakeSkip(p);
    return this.partsChangedRepo.findAndCount({
      where: w,
      select: s,
      relations: r,
      order: o,
      take,
      skip,
    });
  };

  async update(id: string, payload: UpdatePartsChangedDTO, userId: string) {
    const data = await this.findOrFail({ id, userId }, []);
    const updatePayload = this.partsChangedRepo.merge(data, payload);
    await this.partsChangedRepo.update(id, updatePayload);
    return { message: 'Part Updated Successfully' };
  }

  async delete(id: string, userId: string) {
    await this.findOrFail({ id, userId }, []);
    await this.partsChangedRepo.delete(id);
    return { message: 'Part Deleted Successfully' };
  }
}
