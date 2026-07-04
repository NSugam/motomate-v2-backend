import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindAndCountFn, FindOneFn, FindOrFailFn } from 'src/common/orm.type';
import { generateTakeSkip } from 'src/helper/utils';
import { Repository } from 'typeorm';

import { LoggedInUser } from '../user/user.type';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import {
  CreateSharedVehicleDTO,
  UpdateSharedVehicleDTO,
} from './dto/shared-vehicle.dto';
import {
  SharedVehicle,
  SharedVehicleStatusENUM,
} from './entities/shared-vehicle.entity';

@Injectable()
export class SharedVehicleService {
  constructor(
    @InjectRepository(SharedVehicle)
    private readonly repo: Repository<SharedVehicle>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
  ) {}

  async create(payload: CreateSharedVehicleDTO, user: LoggedInUser) {
    const vehicle = await this.vehicleRepo.findOne({
      where: { id: payload.vehicleId, user: { id: user.id } },
    });

    if (!vehicle)
      throw new UnauthorizedException(
        'You dont have permission to access this vehicle.',
      );

    const exists = await this.repo.findOne({
      where: {
        vehicleId: payload.vehicleId,
        sharedWithUserId: payload.sharedWithUserId,
        sharedByUserId: user.id,
      },
    });

    if (exists) {
      return {
        message: 'Already shared with this user',
        id: exists.id,
      };
    }

    const data = this.repo.create({
      vehicleId: payload.vehicleId,
      sharedWithUserId: payload.sharedWithUserId,
      sharedByUserId: user.id,
      permission: payload.permission,
      status: SharedVehicleStatusENUM.PENDING,
    });

    const saved = await this.repo.save(data);

    return {
      message: 'Vehicle shared successfully',
      id: saved.id,
    };
  }

  findOne: FindOneFn<SharedVehicle> = (where, select, relations) => {
    return this.repo.findOne({ where, select, relations });
  };

  findOrFail: FindOrFailFn<SharedVehicle> = async (
    where,
    select = [],
    relations = [],
  ) => {
    return this.repo.findOneOrFail({ where, select, relations });
  };

  findAndCount: FindAndCountFn<SharedVehicle> = (w, s, p, o, r) => {
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

  async update(id: string, payload: UpdateSharedVehicleDTO, userId: string) {
    const data = await this.findOrFail({ id, sharedByUserId: userId });

    if (payload.permission) {
      data.permission = payload.permission;
    }

    await this.repo.save(data);

    return {
      message: 'Shared vehicle updated successfully',
    };
  }

  async accept(id: string, user: LoggedInUser) {
    const data = await this.repo.findOne({
      where: {
        id,
        sharedWithUserId: user.id,
        status: SharedVehicleStatusENUM.PENDING,
      },
    });

    if (!data) {
      throw new UnauthorizedException('Invalid or expired request');
    }

    data.status = SharedVehicleStatusENUM.ACCEPTED;

    await this.repo.save(data);

    return {
      message: 'Vehicle shared request accepted',
    };
  }

  async delete(id: string, userId: string) {
    const data = await this.findOrFail({ id, sharedWithUserId: userId });

    await this.repo.remove(data);

    return {
      message: 'Sharing removed successfully',
    };
  }
}
