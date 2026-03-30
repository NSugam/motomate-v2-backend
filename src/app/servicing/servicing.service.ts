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
import { VehicleService } from '../vehicle/vehicle.service';
import { CreateServicingDTO, UpdateServicingDTO } from './dto/servicing.dto';
import { Servicing } from './entities/servicing.entity';

type ServicingTotals = {
  totalServicingCost: number;
  totalCostWithParts: number;
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
    private readonly vehicleService: VehicleService,
  ) {}

  async create(payload: CreateServicingDTO, user: LoggedInUser) {
    // Create servicing entity
    const servicing = this.servicingRepo.create({
      location: payload.location,
      counter: payload.counter,
      servicingCost: payload.servicingCost,
      englishDate: payload.englishDate,
      odoReading: payload.odoReading,
      remarks: payload.remarks,
      userId: user.id,
      vehicleId: user.defaultVehicleId,
    });

    // Attach parts changed
    const partsChangedEntities = await Promise.all(
      payload.partsChanged.map(async (p) => {
        const part = await this.partRepo.findOneOrFail({
          where: { id: p.partId, userId: user.id },
        });

        return this.partsChangedRepo.create({
          part,
          cost: p.cost,
          userId: user.id,
          vehicleId: user.defaultVehicleId,
          fromServicing: true,
        });
      }),
    );

    servicing.partsChanged = partsChangedEntities;

    // Calculate totalCostWithParts
    const partsTotal = partsChangedEntities.reduce(
      (sum, pc) => sum + pc.cost,
      0,
    );
    servicing['totalCostWithParts'] =
      (servicing.servicingCost || 0) + partsTotal;

    // Save servicing
    const saved = await this.servicingRepo.save(servicing);

    await this.vehicleService.verifyAndUpdate(user.defaultVehicleId, user.id, {
      odoReading: payload.odoReading,
      afe: undefined,
    });

    return {
      message: 'Servicing Created Successfully',
      saved,
    };
  }

  async update(
    id: string,
    payload: UpdateServicingDTO,
    userId: string,
    vehicleId: string,
  ) {
    const servicing = await this.servicingRepo.findOneOrFail({
      where: { id, userId },
      relations: ['partsChanged', 'partsChanged.part'],
    });

    if (payload.location !== undefined) servicing.location = payload.location;
    if (payload.counter !== undefined) servicing.counter = payload.counter;
    if (payload.servicingCost !== undefined)
      servicing.servicingCost = payload.servicingCost;
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
            vehicleId,
            fromServicing: true,
          });

          updatedParts.push(newRecord);
        }
      }

      // remove deleted parts
      const updatedIds = updatedParts.filter((p) => p.id).map((p) => p.id);
      const toDelete = existing.filter((p) => !updatedIds.includes(p.id));
      if (toDelete.length) await this.partsChangedRepo.remove(toDelete);

      servicing.partsChanged = updatedParts;
    }

    // ===== CALCULATE totalCostWithParts =====
    const partsTotal = (servicing.partsChanged || []).reduce(
      (sum, p) => sum + (p.cost || 0),
      0,
    );
    servicing['totalCostWithParts'] =
      (servicing.servicingCost || 0) + partsTotal;

    // Save updated servicing
    await this.servicingRepo.save(servicing);

    const { afe } = await this.vehicleService.getAFE({ userId, vehicleId });
    await this.vehicleService.verifyAndUpdate(vehicleId, userId, {
      odoReading: payload.odoReading,
      afe: afe || undefined,
    });

    return {
      message: 'Servicing Updated Successfully',
      data: servicing,
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
      .select('COALESCE(SUM(s.servicingCost), 0)', 'totalServicingCost')
      .addSelect('COALESCE(SUM(s.totalCostWithParts), 0)', 'totalCostWithParts')
      .where(where)
      .getRawOne<{
        totalServicingCost: string;
        totalCostWithParts: string;
      }>();

    const message: ServicingTotals = {
      totalServicingCost: Number(totalsRaw.totalServicingCost),
      totalCostWithParts: Number(totalsRaw.totalCostWithParts),
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
