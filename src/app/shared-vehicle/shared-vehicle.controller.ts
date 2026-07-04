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
import { ILike } from 'typeorm';

import { UserFilterType } from 'src/common/common.type';
import { IdDTO, optionalPagiSearchTermDTO } from 'src/common/dto';
import { GetUser, UserFilter } from 'src/decorators/get-user.decorator';

import { OrmWhereType } from 'src/common/orm.type';
import { LoggedInUser } from '../user/user.type';

import {
  CreateSharedVehicleDTO,
  UpdateSharedVehicleDTO,
} from './dto/shared-vehicle.dto';

import { ApiOperation } from '@nestjs/swagger';
import { VehicleAccessHelper } from 'src/vehicle-access/vehicle-access.helper';
import {
  sharedVehicleRelations,
  sharedVehicleSelect,
} from './dto/shared-vehicle.select';
import { SharedVehicle } from './entities/shared-vehicle.entity';
import { SharedVehicleService } from './shared-vehicle.service';

@Controller('shared-vehicle')
export class SharedVehicleController {
  constructor(
    private readonly service: SharedVehicleService,
    private readonly vehicleAccessHelper: VehicleAccessHelper,
  ) {}

  @Post()
  create(@Body() body: CreateSharedVehicleDTO, @GetUser() user: LoggedInUser) {
    return this.service.create(body, user);
  }

  @Get()
  @ApiOperation({ summary: 'List of vehicles shared to me.' })
  findAll(
    @Query() { searchTerm, ...pagination }: optionalPagiSearchTermDTO,
    @UserFilter() { userId }: UserFilterType,
  ) {
    const filter: OrmWhereType<SharedVehicle> = {
      sharedWithUserId: userId,
    };

    if (searchTerm) {
      filter.vehicle = {
        model: ILike(`%${searchTerm}%`),
      };
    }

    return this.service.findAndCount(
      filter,
      sharedVehicleSelect,
      pagination,
      { createdAt: 'DESC' },
      sharedVehicleRelations,
    );
  }

  @Get('sent')
  @ApiOperation({ summary: 'List of vehicles I have shared.' })
  sent(
    @Query() { searchTerm, ...pagination }: optionalPagiSearchTermDTO,
    @UserFilter() { userId }: UserFilterType,
  ) {
    const filter: OrmWhereType<SharedVehicle> = {
      vehicle: {
        user: { id: userId },
      },
    };

    if (searchTerm) {
      filter.sharedWithUserId = ILike(`%${searchTerm}%`);
    }

    return this.service.findAndCount(
      filter,
      sharedVehicleSelect,
      pagination,
      { createdAt: 'DESC' },
      ['vehicle', 'sharedWith'],
    );
  }

  @Get('/get-permission')
  async getVehiclePermission(
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    return this.vehicleAccessHelper.getAccessType(userId, vehicleId);
  }

  @Patch(':id/accept')
  @ApiOperation({ summary: 'Accept the incoming share request.' })
  accept(@Param() { id }: IdDTO, @GetUser() user: LoggedInUser) {
    return this.service.accept(id, user);
  }

  @Get(':id')
  findOne(@Param() { id }: IdDTO, @UserFilter() { userId }: UserFilterType) {
    return this.service.findOrFail(
      {
        id,
        sharedWithUserId: userId,
      },
      sharedVehicleSelect,
      ['vehicle'],
    );
  }

  @Patch(':id')
  update(
    @Param() { id }: IdDTO,
    @Body() body: UpdateSharedVehicleDTO,
    @UserFilter() { userId }: UserFilterType,
  ) {
    return this.service.update(id, body, userId);
  }

  @Delete(':id')
  delete(@Param() { id }: IdDTO, @UserFilter() { userId }: UserFilterType) {
    return this.service.delete(id, userId);
  }
}
