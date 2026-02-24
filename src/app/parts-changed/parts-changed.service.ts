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

import { Part } from '../part/entities/part.entity';
import { Servicing } from '../servicing/entities/servicing.entity';
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

    @InjectRepository(Part)
    private readonly partRepo: Repository<Part>,

    @InjectRepository(Servicing)
    private readonly servicingRepo: Repository<Servicing>,
  ) {}

  async create(payload: CreatePartsChangedDTO, user: LoggedInUser) {
    if (payload.servicingId) {
      await this.servicingRepo.findOneOrFail({
        where: { id: payload.servicingId },
      });
    }
    const part = await this.partRepo.findOneOrFail({
      where: { id: payload.partId },
    });

    const data = this.partsChangedRepo.create({
      servicing: payload.servicingId ? { id: payload.servicingId } : null,
      part,
      odoReading: payload.odoReading,
      englishDate: payload.englishDate,
      cost: payload.cost,
      userId: user.id,
    });

    const saved = await this.partsChangedRepo.save(data);
    return { message: 'Part Changed Record Added Successfully', id: saved.id };
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
    const data = await this.findOrFail({ id, userId });

    if (payload.servicingId) {
      data.servicing = await this.servicingRepo.findOneOrFail({
        where: { id: payload.servicingId },
      });
    }

    if (payload.partId) {
      data.part = await this.partRepo.findOneOrFail({
        where: { id: payload.partId },
      });
    }

    if (payload.odoReading !== undefined) data.odoReading = payload.odoReading;
    if (payload.cost !== undefined) data.cost = payload.cost;

    await this.partsChangedRepo.save(data);
    return { message: 'Part Change Record Updated Successfully' };
  }

  async delete(id: string, userId: string) {
    await this.findOrFail({ id, userId }, []);
    await this.partsChangedRepo.delete(id);
    return { message: 'Part Change Record Deleted Successfully' };
  }
}
