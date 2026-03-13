import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFilterType } from 'src/common/common.type';
import {
  FailOnFoundFn,
  FindAndCountFn,
  FindManyFn,
  FindOneFn,
  FindOrFailFn,
} from 'src/common/orm.type';
import { generateTakeSkip } from 'src/helper/utils';
import { DataSource, Repository } from 'typeorm';
import { CreateFillupsDTO } from './dto/fillups.dto';
import { Fillups } from './entities/fillup.entity';

@Injectable()
export class FillupsService {
  constructor(
    @InjectRepository(Fillups)
    private readonly fillupsRepo: Repository<Fillups>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    payload: CreateFillupsDTO,
    { userId, vehicleId }: UserFilterType,
  ) {
    let distance = null;
    let mileage = null;

    const previous = await this.fillupsRepo.findOne({
      where: {
        userId,
        vehicleId,
      },
      order: { odoReading: 'DESC' },
    });

    if (previous && Number(previous.odoReading) >= Number(payload.odoReading)) {
      throw new BadRequestException([
        'Odometer reading cannot be less than or equal to previous reading',
      ]);
    }

    if (previous) {
      distance = Number(payload.odoReading) - Number(previous.odoReading);
      if (distance > 0 && !payload.isPartial && !previous.isPartial) {
        mileage = distance / payload.quantity;
      }
    }

    const data = this.fillupsRepo.create({
      ...payload,
      userId,
      vehicleId,
      distance,
      mileage,
    });

    const fillup = await this.fillupsRepo.save(data);

    return { message: 'Fillup Created Successfully', id: fillup.id };
  }

  findOne: FindOneFn<Fillups> = (where, select, relations) => {
    return this.fillupsRepo.findOne({ where, select, relations });
  };

  findOrFail: FindOrFailFn<Fillups> = async (where, select, relations) => {
    return this.fillupsRepo.findOneOrFail({ where, select, relations });
  };

  failOnFound: FailOnFoundFn<Fillups> = async (where, relations) => {
    const data = await this.findOne(where, ['id'], relations);
    if (data) {
      throw new BadRequestException([
        `Fillup Already Exists With Id ${data.id}`,
      ]);
    }
  };

  findMany: FindManyFn<Fillups> = (w, s, o, r) => {
    return this.fillupsRepo.find({
      where: w,
      select: s,
      relations: r,
      order: o,
    });
  };

  findAndCount: FindAndCountFn<Fillups> = (w, s, p, o, r) => {
    const { take, skip } = generateTakeSkip(p);
    return this.fillupsRepo.findAndCount({
      where: w,
      select: s,
      relations: r,
      order: o,
      take,
      skip,
    });
  };

  async update(
    id: string,
    { userId, vehicleId }: UserFilterType,
    payload: CreateFillupsDTO,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repository = queryRunner.manager.getRepository(Fillups);

      const existing = await repository.findOneOrFail({
        where: { id, userId, vehicleId },
      });

      // Get all records ordered by odo
      const all = await repository.find({
        where: { userId, vehicleId },
        order: { odoReading: 'ASC' },
      });

      const index = all.findIndex((f) => f.id === id);

      const previous = all[index - 1] || null;
      const next = all[index + 1] || null;

      // Validate odo
      if (
        previous &&
        Number(previous.odoReading) >= Number(payload.odoReading)
      ) {
        throw new BadRequestException([
          'Odometer must be greater than previous reading',
        ]);
      }

      if (next && Number(next.odoReading) <= Number(payload.odoReading)) {
        throw new BadRequestException([
          'Odometer must be less than next reading',
        ]);
      }

      let distance = null;
      let mileage = null;

      if (previous) {
        distance = Number(payload.odoReading) - Number(previous.odoReading);

        if (
          distance > 0 &&
          !payload.isPartial &&
          !previous.isPartial &&
          payload.quantity > 0
        ) {
          mileage = distance / payload.quantity;
        }
      }

      const updated = repository.merge(existing, {
        ...payload,
        distance,
        mileage,
      });

      await repository.save(updated);

      // Recalculate next
      if (next) {
        const newDistance =
          Number(next.odoReading) - Number(payload.odoReading);

        let newMileage = null;

        if (!next.isPartial && newDistance > 0 && next.quantity > 0) {
          newMileage = newDistance / next.quantity;
        }

        if (payload.isPartial) {
          next.mileage = null;
        } else {
          next.distance = newDistance > 0 ? newDistance : null;
          next.mileage = newMileage;
        }

        await repository.save(next);
      }

      await queryRunner.commitTransaction();

      return { message: 'Fillup Updated Successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async delete(id: string, { userId, vehicleId }: UserFilterType) {
    await this.findOrFail({ id, userId, vehicleId });
    await this.fillupsRepo.delete(id);
    return { message: 'Fillup Deleted Successfully' };
  }
}
