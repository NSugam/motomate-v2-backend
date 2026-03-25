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
import { GetUser, UserFilter } from 'src/decorators/get-user.decorator';
import { ILike } from 'typeorm';
import { LoggedInUser } from '../user/user.type';
import { CreateVehicleDTO, UpdateVehicleDTO } from './dto/vehicle.dto';
import {
  vehicleRelations,
  vehicleSelectWithRelation,
} from './dto/vehicle.select.dto';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleService } from './vehicle.service';

@Controller('vehicle')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get('my-default')
  myDefaultVehicle(@GetUser() user: LoggedInUser) {
    return this.vehicleService.findOrFail(
      { id: user.defaultVehicleId },
      vehicleSelectWithRelation,
      vehicleRelations,
    );
  }

  @Patch('my-default')
  updateDefault(
    @Body() body: UpdateVehicleDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    return this.vehicleService.update(vehicleId, userId, body);
  }

  @Get()
  findAll(
    @Query() { searchTerm, ...pagination }: optionalPagiSearchTermDTO,
    @UserFilter() { userId }: UserFilterType,
  ) {
    const filter: OrmWhereType<Vehicle> = { user: { id: userId } };
    if (searchTerm) filter.brand = ILike(`%${searchTerm}%`);
    return this.vehicleService.findAndCount(
      filter,
      vehicleSelectWithRelation,
      pagination,
      {
        createdAt: 'DESC',
      },
      vehicleRelations,
    );
  }

  @Get(':id')
  findOne(@Param() { id }: IdDTO, @UserFilter() { userId }: UserFilterType) {
    return this.vehicleService.findOrFail(
      { id, user: { id: userId } },
      vehicleSelectWithRelation,
      vehicleRelations,
    );
  }

  @Post()
  create(@Body() body: CreateVehicleDTO, @GetUser() user: LoggedInUser) {
    return this.vehicleService.create(body, user);
  }

  @Patch(':id')
  update(
    @Body() body: UpdateVehicleDTO,
    @Param() { id }: IdDTO,
    @UserFilter() { userId }: UserFilterType,
  ) {
    return this.vehicleService.update(id, userId, body);
  }

  @Delete(':id')
  delete(@Param() { id }: IdDTO, @UserFilter() { userId }: UserFilterType) {
    return this.vehicleService.delete(id, userId);
  }
}
