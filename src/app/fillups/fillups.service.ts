import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFilterType } from 'src/common/common.type';
import {
  FailOnFoundFn,
  FindAndCountFn,
  FindManyFn,
  FindOneFn,
  FindOrFailFn,
  OrmWhereType,
} from 'src/common/orm.type';
import { generateTakeSkip } from 'src/helper/utils';
import {
  DataSource,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  Repository,
} from 'typeorm';
import { VehicleService } from '../vehicle/vehicle.service';
import { CreateFillupsDTO } from './dto/fillups.dto';
import { Fillups } from './entities/fillup.entity';
import { recalcDistanceAndMileage } from './fillups.helper';

type FillupsTotals = {
  afe: number;
  totalSpent: number;
};

@Injectable()
export class FillupsService {
  constructor(
    @InjectRepository(Fillups)
    private readonly fillupsRepo: Repository<Fillups>,
    private readonly vehicleService: VehicleService,
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

    const { afe } = await this.vehicleService.getAFE({ userId, vehicleId });
    await this.vehicleService.verifyAndUpdate(vehicleId, userId, {
      odoReading: payload.odoReading,
      afe: afe || undefined,
    });

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

  async findAndCountWithTotal(
    where: OrmWhereType<Fillups>,
    select: FindOptionsSelect<Fillups>,
    pagination: { take?: number; skip?: number },
    order: FindOptionsOrder<Fillups>,
    relations: FindOptionsRelations<Fillups>,
  ): Promise<{
    data: Fillups[];
    count: number;
    message: FillupsTotals;
  }> {
    const [data, count] = await this.fillupsRepo.findAndCount({
      where,
      select,
      relations,
      order,
      skip: pagination.skip,
      take: pagination.take,
    });

    const totalSpentRaw = await this.fillupsRepo
      .createQueryBuilder('f')
      .select('COALESCE(SUM(f.totalCost), 0)', 'totalSpent')
      .where(where)
      .getRawOne<{ totalSpent: string }>();

    const afeRaw = await this.fillupsRepo
      .createQueryBuilder()
      .select('COALESCE(AVG(sub.mileage), 0)', 'afe')
      .from((subQuery) => {
        return subQuery
          .select('f.mileage', 'mileage')
          .from('fillups', 'f')
          .where(where)
          .andWhere('f.isPartial = false')
          .orderBy('f.created_at', 'DESC')
          .limit(5);
      }, 'sub')
      .getRawOne<{ afe: string }>();

    const message: FillupsTotals = {
      totalSpent: Number(totalSpentRaw.totalSpent),
      afe: Number(Number(afeRaw.afe).toFixed(2)),
    };

    return {
      data,
      count,
      message,
    };
  }

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

      const current = repository.merge(existing, payload);
      await recalcDistanceAndMileage(repository, previous, current);

      if (next) {
        await recalcDistanceAndMileage(repository, current, next);
      }
      await queryRunner.commitTransaction();

      const { afe } = await this.vehicleService.getAFE({ userId, vehicleId });
      await this.vehicleService.verifyAndUpdate(vehicleId, userId, {
        odoReading: payload.odoReading,
        afe: afe || undefined,
      });

      return { message: 'Fillup Updated Successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string, { userId, vehicleId }: UserFilterType) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repository = queryRunner.manager.getRepository(Fillups);

      await repository.findOneOrFail({
        where: { id, userId, vehicleId },
      });

      const all = await repository.find({
        where: { userId, vehicleId },
        order: { odoReading: 'ASC' },
      });

      const index = all.findIndex((f) => f.id === id);
      const previous = all[index - 1] || null;
      const next = all[index + 1] || null;

      await repository.delete(id);

      if (next) {
        await recalcDistanceAndMileage(repository, previous, next);
      }

      await queryRunner.commitTransaction();

      const { afe } = await this.vehicleService.getAFE({ userId, vehicleId });
      await this.vehicleService.verifyAndUpdate(vehicleId, userId, {
        odoReading: undefined,
        afe: afe || undefined,
      });
      return { message: 'Fillup Deleted Successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
