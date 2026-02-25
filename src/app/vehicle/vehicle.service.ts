import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FailOnFoundFn,
  FindAndCountFn,
  FindOneFn,
  FindOrFailFn,
} from 'src/common/orm.type';
import { generateTakeSkip } from 'src/helper/utils';
import { Repository } from 'typeorm';
import { LoggedInUser } from '../user/user.type';
import { CreateVehicleDTO, UpdateVehicleDTO } from './dto/vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';

@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
  ) {}

  async create(payload: CreateVehicleDTO, user: LoggedInUser) {
    const data = this.vehicleRepo.create({
      ...payload,
      user: { id: user.id },
    });

    const vehicle = await this.vehicleRepo.save(data);
    return { message: 'Vehicle Created Successfully', id: vehicle.id };
  }

  findOne: FindOneFn<Vehicle> = (where, select, relations) => {
    return this.vehicleRepo.findOne({ where, select, relations });
  };

  findOrFail: FindOrFailFn<Vehicle> = async (where, select, relations) => {
    try {
      return await this.vehicleRepo.findOneOrFail({ where, select, relations });
    } catch {
      throw new NotFoundException(`Vehicle not found.`);
    }
  };

  failOnFound: FailOnFoundFn<Vehicle> = async (where, relations) => {
    const data = await this.findOne(where, ['id'], relations);
    if (data) {
      throw new BadRequestException([
        `Vehicle Already Exists With Id ${data.id}`,
      ]);
    }
  };

  findAndCount: FindAndCountFn<Vehicle> = (w, s, p, o, r) => {
    const { take, skip } = generateTakeSkip(p);
    return this.vehicleRepo.findAndCount({
      where: w,
      select: s,
      relations: r,
      order: o,
      take,
      skip,
    });
  };

  async update(id: string, userId: string | null, payload: UpdateVehicleDTO) {
    const data = await this.findOrFail({ id, user: { id: userId } }, []);
    const updatePayload = this.vehicleRepo.merge(data, payload);
    await this.vehicleRepo.update(id, updatePayload);
    return { message: 'Vehicle Updated Successfully' };
  }

  async delete(id: string, userId: string | null) {
    await this.findOrFail({ id, user: { id: userId } });
    await this.vehicleRepo.delete(id);
    return { message: 'Vehicle Deleted Successfully' };
  }
}
