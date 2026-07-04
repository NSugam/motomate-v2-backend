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
import { VehicleAccessHelper } from 'src/vehicle-access/vehicle-access.helper';
import { ILike } from 'typeorm';
import { SharedVehiclePermissionENUM } from '../shared-vehicle/entities/shared-vehicle.entity';
import { LoggedInUser } from '../user/user.type';
import { CreatePartDTO, UpdatePartDTO } from './dto/part.dto';
import { partsRelations, partsSelectWithRelation } from './dto/parts.select';
import { Part } from './entities/part.entity';
import { PartService } from './part.service';

@Controller('part')
export class PartController {
  constructor(
    private readonly partService: PartService,
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
    const filter: OrmWhereType<Part> = { vehicleId };
    if (searchTerm) filter.name = ILike(`%${searchTerm}%`);
    return this.partService.findAndCount(
      filter,
      partsSelectWithRelation,
      pagination,
      {
        name: 'ASC',
      },
      partsRelations,
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
    return this.partService.findOne(
      { id },
      partsSelectWithRelation,
      partsRelations,
    );
  }

  @Post()
  async create(@Body() body: CreatePartDTO, @GetUser() user: LoggedInUser) {
    await this.vehicleAccessHelper.validateAccess(
      user.id,
      user.defaultVehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    return this.partService.create(body, user);
  }

  @Patch(':id')
  async update(
    @Param() { id }: IdDTO,
    @Body() body: UpdatePartDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    return this.partService.update(id, body);
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
    return this.partService.delete(id);
  }

  @Delete('force/:id')
  async forceDelete(
    @Param() { id }: IdDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    return this.partService.forceDelete(id);
  }
}
