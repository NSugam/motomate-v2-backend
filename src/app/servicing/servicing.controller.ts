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
import { IdDTO } from 'src/common/dto';
import { OrmWhereType } from 'src/common/orm.type';
import { GetUser, UserFilter } from 'src/decorators/get-user.decorator';
import { VehicleAccessHelper } from 'src/vehicle-access/vehicle-access.helper';
import { ILike } from 'typeorm';
import { SharedVehiclePermissionENUM } from '../shared-vehicle/entities/shared-vehicle.entity';
import { LoggedInUser } from '../user/user.type';
import { ServicingFilter } from './dto/filter.servicing';
import { CreateServicingDTO, UpdateServicingDTO } from './dto/servicing.dto';
import {
  servicingRelations,
  servicingSelectWithRelation,
} from './dto/servicing.select';
import { Servicing } from './entities/servicing.entity';
import { ServicingService } from './servicing.service';

@Controller('servicing')
export class ServicingController {
  constructor(
    private readonly servicingService: ServicingService,
    private readonly vehicleAccessHelper: VehicleAccessHelper,
  ) {}

  @Post()
  async create(
    @Body() body: CreateServicingDTO,
    @GetUser() user: LoggedInUser,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      user.id,
      user.defaultVehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    return this.servicingService.create(body, user);
  }

  @Get()
  async findAll(
    @Query() { searchTerm, vehicleIdFilter, ...pagination }: ServicingFilter,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    const filter: OrmWhereType<Servicing> = { vehicleId };

    if (searchTerm) filter.location = ILike(`%${searchTerm}%`);

    if (vehicleIdFilter) filter.vehicleId = vehicleIdFilter;
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );

    return this.servicingService.findAndCountWithTotal(
      filter,
      servicingSelectWithRelation,
      pagination,
      {
        createdAt: 'DESC',
      },
      servicingRelations,
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
    return this.servicingService.findOne(
      { id, userId },
      servicingSelectWithRelation,
      servicingRelations,
    );
  }

  @Patch(':id')
  async update(
    @Param() { id }: IdDTO,
    @Body() body: UpdateServicingDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.EDIT,
    );
    return this.servicingService.update(id, body, userId, vehicleId);
  }

  @Delete(':id')
  async delete(
    @Param() { id }: IdDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.EDIT,
    );
    return this.servicingService.delete(id);
  }
}
