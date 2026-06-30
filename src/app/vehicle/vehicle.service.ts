import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFilterType } from 'src/common/common.type';
import {
  FailOnFoundFn,
  FindAndCountFn,
  FindOneFn,
  FindOrFailFn,
} from 'src/common/orm.type';
import { generateTakeSkip } from 'src/helper/utils';
import { MasterData } from 'src/master-data/entities/md_bikes.entity';
import { Repository } from 'typeorm';
import { Fillups } from '../fillups/entities/fillup.entity';
import { ServiceReminder } from '../service-reminder/entities/service-reminder.entity';
import { UploadService } from '../upload/upload.service';
import { User } from '../user/entities/user.entity';
import { LoggedInUser } from '../user/user.type';
import { CreateVehicleDTO, UpdateVehicleDTO } from './dto/vehicle.dto';
import { Vehicle } from './entities/vehicle.entity';
import { env } from 'src/config/env';
@Injectable()
export class VehicleService {
  constructor(
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Fillups)
    private readonly fillupsRepo: Repository<Fillups>,
    @InjectRepository(MasterData)
    private readonly masterDataRepo: Repository<MasterData>,
    @InjectRepository(ServiceReminder)
    private readonly serviceReminderEntity: Repository<ServiceReminder>,
    private readonly uploadService: UploadService,
  ) {}

  async create(payload: CreateVehicleDTO, user: LoggedInUser) {
    if (user.vehicles.length >= 2 && !env.MASTER_EMAILS.includes(user.email))
      throw new BadRequestException('You can only add 2 vehicles.');

    const data = this.vehicleRepo.create({
      ...payload,
      user: { id: user.id },
      masterData: { id: payload.masterDataId },
    });

    const vehicle = await this.vehicleRepo.save(data);
    if (user.defaultVehicleId === null)
      await this.userRepo.update(user.id, { defaultVehicleId: vehicle.id });

    await this.serviceReminderEntity.save({
      userId: user.id,
      vehicleId: vehicle.id,
    });
    return { message: 'Vehicle Created Successfully', id: vehicle.id };
  }

  async updateVehicleImage(file: Express.Multer.File, user: LoggedInUser) {
    const uploaded = await this.uploadService.uploadAndSave(file, user);

    const vehicle = await this.vehicleRepo.findOne({
      where: { id: user.defaultVehicleId },
      relations: ['vehicleImage'],
    });
    if (!vehicle) throw new BadRequestException('Vehicle not found');

    const oldImage = vehicle.vehicleImage;
    vehicle.vehicleImage = uploaded;
    await this.vehicleRepo.save(vehicle);

    if (oldImage?.id) {
      await this.uploadService.deleteUpload(oldImage.id, user);
    }

    return {
      message: `${vehicle.brand + vehicle.model} Image Updated Successfully`,
    };
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

  async update(
    vehicleId: string,
    userId: string | null,
    payload: UpdateVehicleDTO,
  ) {
    const data = await this.findOrFail(
      { id: vehicleId, user: { id: userId } },
      [],
    );

    let masterData = data.masterData;

    if (payload.masterDataId) {
      masterData = await this.masterDataRepo.findOne({
        where: { id: payload.masterDataId },
      });

      if (!masterData) {
        throw new NotFoundException('Master Data Not Found');
      }
    }

    if (payload.soldEnglishDate) {
      const serviceReminder = await this.serviceReminderEntity.findOneBy({
        vehicleId,
      });
      if (!serviceReminder) return;
      serviceReminder.isDisabled = true;
      await this.serviceReminderEntity.save(serviceReminder);
    }

    const updatePayload = this.vehicleRepo.merge(data, {
      ...payload,
      masterData,
    });

    await this.vehicleRepo.save(updatePayload);

    return { message: 'Vehicle Updated Successfully' };
  }

  async getAFE({
    userId,
    vehicleId,
  }: UserFilterType): Promise<{ afe: number }> {
    const afeRaw = await this.fillupsRepo
      .createQueryBuilder()
      .select('COALESCE(AVG(sub.mileage), 0)', 'afe')
      .from((subQuery) => {
        return subQuery
          .select('f.mileage', 'mileage')
          .from('fillups', 'f')
          .where('f.userId = :userId', { userId })
          .andWhere('f.vehicleId = :vehicleId', { vehicleId })
          .andWhere('f.isPartial = false')
          .orderBy('f.created_at', 'DESC')
          .limit(5);
      }, 'sub')
      .getRawOne<{ afe: string }>();

    return {
      afe: Number(Number(afeRaw.afe).toFixed(2)),
    };
  }

  async verifyAndUpdate(
    vehicleId: string,
    userId: string | null,
    payload: UpdateVehicleDTO,
  ) {
    const existing = await this.findOrFail(
      { id: vehicleId, user: { id: userId } },
      [],
    );

    const updateData: Partial<UpdateVehicleDTO> = {};

    if (
      payload.odoReading !== undefined &&
      payload.odoReading > existing.odoReading
    ) {
      updateData.odoReading = payload.odoReading;
    }

    if (payload.afe !== undefined && payload.afe !== existing.afe) {
      updateData.afe = payload.afe;
    }

    if (Object.keys(updateData).length > 0) {
      await this.vehicleRepo.update(vehicleId, updateData);
      return { message: 'Vehicle Updated Successfully' };
    }

    return { message: 'Nothing to update' };
  }

  async delete(id: string, userId: string | null) {
    await this.findOrFail({ id, user: { id: userId } });
    await this.vehicleRepo.delete(id);
    return { message: 'Vehicle Deleted Successfully' };
  }
}
