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
import { In, Repository } from 'typeorm';
import { PartsChanged } from '../parts-changed/entities/parts-changed.entity';
import { LoggedInUser } from '../user/user.type';
import { VehicleService } from '../vehicle/vehicle.service';
import { CreateServicingDTO, UpdateServicingDTO } from './dto/servicing.dto';
import { Servicing } from './entities/servicing.entity';

@Injectable()
export class ServicingService {
  constructor(
    @InjectRepository(Servicing)
    private readonly servicingRepo: Repository<Servicing>,
    @InjectRepository(PartsChanged)
    private readonly partsChangedRepo: Repository<PartsChanged>,

    private readonly vehicleService: VehicleService,
  ) {}

  async create(
    payload: CreateServicingDTO,
    vehicleId: string,
    user: LoggedInUser,
  ) {
    const vehicle = await this.vehicleService.findOrFail({
      id: vehicleId,
      userId: user.id,
    });
    const servicing = this.servicingRepo.create({
      ...payload,
      userId: user.id,
      vehicle,
    });

    // Handling PartsChanged
    if (payload.partsChangedIds && payload.partsChangedIds.length) {
      const parts = await this.partsChangedRepo.findBy({
        id: In(payload.partsChangedIds),
      });
      if (parts.length < payload.partsChangedIds.length)
        throw new BadRequestException([`Some parts Id not found`]);

      servicing.partsChanged = parts;
    }

    const saved = await this.servicingRepo.save(servicing);
    return { message: 'Servicing Added Successfully', id: saved.id };
  }

  async update(id: string, userId: string, payload: UpdateServicingDTO) {
    const servicing = await this.findOrFail({ id, userId }, []);

    const updatePayload = this.servicingRepo.merge(servicing, payload);

    // Handle partsChanged
    if (payload.partsChangedIds) {
      const parts = await this.partsChangedRepo.findBy({
        id: In(payload.partsChangedIds),
      });
      if (parts.length < payload.partsChangedIds.length)
        throw new BadRequestException([`Some parts Id not found`]);

      servicing.partsChanged = parts;
    }

    await this.servicingRepo.save(updatePayload);
    return { message: 'Servicing Updated Successfully' };
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

  async delete(id: string, userId: string) {
    await this.findOrFail({ id, userId });
    await this.servicingRepo.delete(id);
    return { message: 'Servicing Deleted Successfully' };
  }
}
