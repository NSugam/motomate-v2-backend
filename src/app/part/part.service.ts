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
import { ILike, Repository } from 'typeorm';
import { LoggedInUser } from '../user/user.type';
import { CreatePartDTO, UpdatePartDTO } from './dto/part.dto';
import { Part } from './entities/part.entity';

@Injectable()
export class PartService {
  constructor(
    @InjectRepository(Part)
    private readonly partRepo: Repository<Part>,
  ) {}

  async create(payload: CreatePartDTO, user: LoggedInUser) {
    const existing = await this.partRepo.findOne({
      where: { name: ILike(payload.name) },
    });
    if (existing)
      throw new BadRequestException(
        `Part Already Exists With Id ${existing.id}`,
      );

    const part = this.partRepo.create({
      ...payload,
      userId: user.id,
      vehicleId: user.defaultVehicleId,
    });
    await this.partRepo.save(part);
    return { message: 'Part Created Successfully', id: part.id };
  }

  findOne: FindOneFn<Part> = (where, select = [], relations = []) => {
    return this.partRepo.findOne({ where, select, relations });
  };

  findOrFail: FindOrFailFn<Part> = async (
    where,
    select = [],
    relations = [],
  ) => {
    return this.partRepo.findOneOrFail({ where, select, relations });
  };

  failOnFound: FailOnFoundFn<Part> = async (where, relations = []) => {
    const data = await this.findOne(where, ['id'], relations);
    if (data)
      throw new BadRequestException([`Part Already Exists With Id ${data.id}`]);
  };

  findMany: FindManyFn<Part> = (w, s = [], o = {}, r = []) => {
    return this.partRepo.find({ where: w, select: s, relations: r, order: o });
  };

  findAndCount: FindAndCountFn<Part> = (w, s = [], p, o = {}, r = []) => {
    const { take, skip } = generateTakeSkip(p);
    return this.partRepo.findAndCount({
      where: w,
      select: s,
      relations: r,
      order: o,
      take,
      skip,
    });
  };

  async update(id: string, payload: UpdatePartDTO, userId: string) {
    const data = await this.findOrFail({ id, userId });
    const updated = this.partRepo.merge(data, payload);
    await this.partRepo.update(id, updated);
    return { message: 'Part Updated Successfully' };
  }

  async delete(id: string, userId: string) {
    await this.findOrFail({ id, userId });
    await this.partRepo.delete(id);
    return { message: 'Part Deleted Successfully' };
  }
}
