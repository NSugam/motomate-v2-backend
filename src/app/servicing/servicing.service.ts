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
import { Part } from '../part/entities/part.entity';
import { PartsChanged } from '../parts-changed/entities/parts-changed.entity';
import { LoggedInUser } from '../user/user.type';
import { CreateServicingDTO, UpdateServicingDTO } from './dto/servicing.dto';
import { Servicing } from './entities/servicing.entity';

type ServicingTotals = {
  totalServicingCost: number;
};
@Injectable()
export class ServicingService {
  constructor(
    @InjectRepository(Servicing)
    private readonly servicingRepo: Repository<Servicing>,
    @InjectRepository(PartsChanged)
    private readonly partsChangedRepo: Repository<PartsChanged>,
    @InjectRepository(Part)
    private readonly partRepo: Repository<Part>,
  ) {}

  async create(payload: CreateServicingDTO, user: LoggedInUser) {
    const servicing = this.servicingRepo.create({
      location: payload.location,
      counter: payload.counter,
      totalCost: payload.totalCost,
      englishDate: payload.englishDate,
      odoReading: payload.odoReading,
      remarks: payload.remarks,
      userId: user.id,
      vehicleId: user.defaultVehicleId,
    });

    // attach parts changed
    servicing.partsChanged = await Promise.all(
      payload.partsChanged.map(async (p) => {
        const part = await this.partRepo.findOneOrFail({
          where: { id: p.partId, userId: user.id },
        });

        return this.partsChangedRepo.create({
          part,
          cost: p.cost,
          userId: user.id,
        });
      }),
    );

    const saved = await this.servicingRepo.save(servicing);

    return {
      message: 'Servicing Created Successfully',
      id: saved.id,
    };
  }

  async update(id: string, payload: UpdateServicingDTO, userId: string) {
    const servicing = await this.servicingRepo.findOneOrFail({
      where: { id, userId },
      relations: ['partsChanged', 'partsChanged.part'],
    });

    if (payload.location !== undefined) servicing.location = payload.location;
    if (payload.counter !== undefined) servicing.counter = payload.counter;
    if (payload.totalCost !== undefined)
      servicing.totalCost = payload.totalCost;
    if (payload.englishDate !== undefined)
      servicing.englishDate = payload.englishDate;
    if (payload.odoReading !== undefined)
      servicing.odoReading = payload.odoReading;
    if (payload.remarks !== undefined) servicing.remarks = payload.remarks;

    // ===== PARTS SYNC LOGIC =====
    if (payload.partsChanged) {
      const existing = servicing.partsChanged;

      const updatedParts = [];

      for (const item of payload.partsChanged) {
        // update existing record
        if (item.id) {
          const record = existing.find((p) => p.id === item.id);
          if (!record) continue;

          if (item.partId) {
            record.part = await this.partRepo.findOneOrFail({
              where: { id: item.partId, userId },
            });
          }

          if (item.cost !== undefined) record.cost = item.cost;

          updatedParts.push(record);
        }

        // add new record
        else {
          const part = await this.partRepo.findOneOrFail({
            where: { id: item.partId, userId },
          });

          const newRecord = this.partsChangedRepo.create({
            servicing,
            part,
            cost: item.cost,
            userId,
          });

          updatedParts.push(newRecord);
        }
      }

      // remove deleted parts
      const updatedIds = updatedParts.filter((p) => p.id).map((p) => p.id);
      const toDelete = existing.filter((p) => !updatedIds.includes(p.id));

      if (toDelete.length) {
        await this.partsChangedRepo.remove(toDelete);
      }

      servicing.partsChanged = updatedParts;
    }

    await this.servicingRepo.save(servicing);

    return {
      message: 'Servicing Updated Successfully',
    };
  }

  findOne: FindOneFn<Servicing> = (where, select, relations) => {
    return this.servicingRepo.findOne({ where, select, relations });
  };

  findOrFail: FindOrFailFn<Servicing> = async (where, select, relations) => {
    return this.servicingRepo.findOneOrFail({ where, select, relations });
  };

  failOnFound: FailOnFoundFn<Servicing> = async (where, relations) => {
    const data = await this.findOne(where, ['id'], relations);
    if (data) {
      throw new BadRequestException([
        `Servicing Already Exists With Id ${data.id}`,
      ]);
    }
  };

  findMany: FindManyFn<Servicing> = (w, s, o, r) => {
    return this.servicingRepo.find({
      where: w,
      select: s,
      relations: r,
      order: o,
    });
  };

  findAndCount: FindAndCountFn<Servicing> = (w, s, p, o, r) => {
    const { take, skip } = generateTakeSkip(p);
    return this.servicingRepo.findAndCount({
      where: w,
      select: s,
      relations: r,
      order: o,
      take,
      skip,
    });
  };

  async findAndCountWithTotal(
    where: OrmWhereType<Servicing>,
    select: FindOptionsSelect<Servicing>,
    pagination: { take?: number; skip?: number },
    order: FindOptionsOrder<Servicing>,
    relations: FindOptionsRelations<Servicing>,
  ): Promise<{
    data: Servicing[];
    count: number;
    message: ServicingTotals;
  }> {
    const [data, count] = await this.servicingRepo.findAndCount({
      where,
      select,
      relations,
      order,
      skip: pagination.skip,
      take: pagination.take,
    });

    const totalsRaw = await this.servicingRepo
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s.totalCost), 0)', 'totalServicingCost')
      .where(where)
      .getRawOne<{
        totalServicingCost: string;
      }>();

    const message: ServicingTotals = {
      totalServicingCost: Number(totalsRaw.totalServicingCost),
    };

    return {
      data,
      count,
      message,
    };
  }

  async delete(id: string, userId: string) {
    await this.findOrFail({ id, userId });
    await this.servicingRepo.delete(id);
    return { message: 'Servicing Deleted Successfully' };
  }
}
