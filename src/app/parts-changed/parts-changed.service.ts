import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  Repository,
} from 'typeorm';

import NepaliDate from 'nepali-date-converter';
import { Part } from '../part/entities/part.entity';
import { Servicing } from '../servicing/entities/servicing.entity';
import { LoggedInUser } from '../user/user.type';
import {
  CreatePartsChangedDTO,
  UpdatePartsChangedDTO,
} from './dto/parts-changed.dto';
import { PartsChanged } from './entities/parts-changed.entity';

type PartsChangedTotals = {
  totalPartsCost: number;
};

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
      vehicleId: user.defaultVehicleId,
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

  async findAndCountWithTotal(
    where: OrmWhereType<PartsChanged>,
    select: FindOptionsSelect<PartsChanged>,
    pagination: { take?: number; skip?: number },
    order: FindOptionsOrder<PartsChanged>,
    relations: FindOptionsRelations<PartsChanged>,
  ): Promise<{
    data: PartsChanged[];
    count: number;
    message: PartsChangedTotals;
  }> {
    const [data, count] = await this.partsChangedRepo.findAndCount({
      where,
      select,
      relations,
      order,
      skip: pagination.skip,
      take: pagination.take,
    });

    const totalsRaw = await this.partsChangedRepo
      .createQueryBuilder('pc')
      .select('COALESCE(SUM(pc.cost), 0)', 'totalPartsCost')
      .where(where)
      .andWhere('pc.fromServicing = :fromServicing', { fromServicing: false })
      .getRawOne<{
        totalPartsCost: string;
      }>();

    const message: PartsChangedTotals = {
      totalPartsCost: Number(totalsRaw.totalPartsCost),
    };

    return {
      data,
      count,
      message,
    };
  }

  async getLatestServicingParts(
    userId: string,
    vehicleId: string,
    fromServicing?: boolean,
    checkReminder?: boolean,
  ): Promise<[PartsChanged[], number]> {
    const qb = this.partsChangedRepo
      .createQueryBuilder('pc')
      .leftJoinAndSelect('pc.part', 'part')
      .leftJoinAndSelect('part.partReminder', 'partReminder')
      .leftJoinAndSelect('pc.servicing', 'servicing')
      .where('pc.userId = :userId', { userId })
      .andWhere('pc.vehicleId = :vehicleId', { vehicleId })
      .andWhere('pc.fromServicing = :fromServicing', {
        fromServicing: fromServicing ?? true,
      });

    if (checkReminder) {
      qb.andWhere('partReminder.id IS NOT NULL');
    }

    qb.andWhere((qb) => {
      const subQuery = qb
        .subQuery()
        .select('pc2.id')
        .from('parts_changed', 'pc2')
        .where('pc2.partId = pc.partId')
        .andWhere('pc2.userId = :userId')
        .andWhere('pc2.vehicleId = :vehicleId')
        .andWhere('pc2.fromServicing = :fromServicing', {
          fromServicing: fromServicing ?? true,
        })
        .orderBy('pc2.odoReading', 'DESC')
        .limit(1)
        .getQuery();

      return 'pc.id = ' + subQuery;
    })
      .select([
        'pc.id',
        'pc.createdAt',
        'pc.odoReading',
        'pc.englishDate',
        'pc.nepaliDate',
        'pc.cost',
        'pc.fromServicing',

        'part.id',
        'part.name',
        'part.description',

        'partReminder.id',
        'partReminder.type',
        'partReminder.odoInterval',
        'partReminder.dateInterval',

        'servicing.id',
        'servicing.counter',
        'servicing.englishDate',
        'servicing.nepaliDate',
        'servicing.odoReading',
      ])
      .orderBy('pc.odoReading', 'DESC');

    const data = await qb.getMany();
    return [data, data.length];
  }

  async getDuePartsReminders(
    userId: string,
    vehicleId: string,
    currentOdo: number,
  ) {
    const [data] = await this.getLatestServicingParts(
      userId,
      vehicleId,
      false,
      true,
    );

    const today = new Date();
    const ODO_BUFFER = 500;
    const DATE_BUFFER = 30; // days

    const result = data
      .map((item) => {
        const reminder = item.part?.partReminder;
        if (!reminder) return null;

        let nextOdo: number | null = null;
        let nextDate: { englishDate: string; nepaliDate: string } | null = null;
        let isDue = false;
        let isUpcoming = false;

        // ODO logic
        if (reminder.odoInterval) {
          nextOdo = Number(item.odoReading) + Number(reminder.odoInterval);

          if (currentOdo >= nextOdo) {
            isDue = true;
          } else if (currentOdo >= nextOdo - ODO_BUFFER) {
            isUpcoming = true;
          }
        }

        // DATE logic
        if (reminder.dateInterval) {
          const baseDate = new Date(item.englishDate);
          const dueDateObj = new Date(baseDate);
          dueDateObj.setDate(baseDate.getDate() + reminder.dateInterval);

          const nepaliDueDate = new NepaliDate(dueDateObj);
          const nepaliDate = nepaliDueDate.format('YYYY MMMM DD', 'np');

          nextDate = {
            englishDate: dueDateObj.toISOString().split('T')[0],
            nepaliDate: nepaliDate,
          };

          if (today >= dueDateObj) {
            isDue = true;
          } else {
            const diffDays =
              (dueDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
            if (diffDays <= DATE_BUFFER) {
              isUpcoming = true;
            }
          }
        }

        const type =
          reminder.odoInterval && reminder.dateInterval
            ? 'any'
            : reminder.odoInterval
              ? 'odo'
              : 'englishDate';

        if (!isDue && !isUpcoming) return null;

        return {
          type,
          partName: item.part?.name,
          lastReplaced: {
            odoReading: item.odoReading,
            englishDate: item.englishDate,
            nepaliDate: item.nepaliDate,
          },
          currentOdo: Number(currentOdo),
          nextOdo,
          nextDate,
          dueOdo: isDue ? currentOdo - nextOdo : null,
          isDue,
          isUpcoming,
        };
      })
      .filter(Boolean);

    return [result, result.length];
  }

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
