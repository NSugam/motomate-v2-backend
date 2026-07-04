import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserFilterType } from 'src/common/common.type';
import { IdDTO, optionalPagiSearchTermDTO } from 'src/common/dto';
import { OrmWhereType } from 'src/common/orm.type';
import { UserFilter } from 'src/decorators/get-user.decorator';
import { VehicleAccessHelper } from 'src/vehicle-access/vehicle-access.helper';
import { ILike } from 'typeorm';
import { SharedVehiclePermissionENUM } from '../shared-vehicle/entities/shared-vehicle.entity';
import { CreateFillupsDTO, UpdateFillupsDTO } from './dto/fillups.dto';
import { Fillups } from './entities/fillup.entity';
import { FillupsService } from './fillups.service';

@Controller('fillups')
export class FillupsController {
  constructor(
    private readonly fillupsService: FillupsService,
    private readonly vehicleAccessHelper: VehicleAccessHelper,
  ) {}

  @Get()
  async findAll(
    @Query() { searchTerm, ...pagination }: optionalPagiSearchTermDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    const filter: OrmWhereType<Fillups> = { vehicleId };

    if (searchTerm) filter.englishDate = ILike(`%${searchTerm}%`);

    return this.fillupsService.findAndCountWithTotal(
      filter,
      {},
      pagination,
      {
        odoReading: 'DESC',
      },
      {},
    );
  }

  @Get(':id')
  async findOne(
    @Param() { id }: IdDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    return this.fillupsService.findOne({ id, vehicleId }, []);
  }

  @Post()
  async create(
    @Body() body: CreateFillupsDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    return this.fillupsService.create(body, { userId, vehicleId });
  }

  @Patch(':id')
  async update(
    @Body() body: UpdateFillupsDTO,
    @Param() { id }: IdDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    return this.fillupsService.update(id, { userId, vehicleId }, body);
  }

  @Delete(':id')
  async delete(
    @Param() { id }: IdDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    return this.fillupsService.delete(id, { userId, vehicleId });
  }
}
