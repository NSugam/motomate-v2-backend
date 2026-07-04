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
import { ApiOperation } from '@nestjs/swagger';
import { UserFilterType } from 'src/common/common.type';
import { IdDTO } from 'src/common/dto';
import { OrmWhereType } from 'src/common/orm.type';
import { GetUser, UserFilter } from 'src/decorators/get-user.decorator';
import { VehicleAccessHelper } from 'src/vehicle-access/vehicle-access.helper';
import { ILike } from 'typeorm';
import { SharedVehiclePermissionENUM } from '../shared-vehicle/entities/shared-vehicle.entity';
import { LoggedInUser } from '../user/user.type';
import {
  CreatePartsChangedDTO,
  UpdatePartsChangedDTO,
} from './dto/parts-changed.dto';
import { PartsChangedFilterDTO } from './dto/parts-changed.filter';
import {
  partsChangedRelations,
  partsChangedSelectFields,
} from './dto/parts-changed.select';
import { PartsChanged } from './entities/parts-changed.entity';
import { PartsChangedService } from './parts-changed.service';

@Controller('parts-changed')
export class PartsChangedController {
  constructor(
    private readonly partsChangedService: PartsChangedService,
    private readonly vehicleAccessHelper: VehicleAccessHelper,
  ) {}

  @Get()
  async findAll(
    @Query()
    { searchTerm, fromServicing, ...pagination }: PartsChangedFilterDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );

    const filter: OrmWhereType<PartsChanged> = { vehicleId };
    if (searchTerm) filter.part = { name: ILike(`%${searchTerm}%`) };
    if (fromServicing !== undefined) filter.fromServicing = fromServicing;

    return this.partsChangedService.findAndCountWithTotal(
      filter,
      partsChangedSelectFields,
      pagination,
      {
        odoReading: 'DESC',
      },
      partsChangedRelations,
    );
  }

  @Get('last-serviced')
  @ApiOperation({ summary: 'Find Last Parts Changed' })
  async getLatestPartsChanged(
    @Query()
    { fromServicing, checkReminder }: PartsChangedFilterDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    return this.partsChangedService.getLatestServicingParts(
      vehicleId,
      fromServicing,
      checkReminder,
    );
  }

  @Get('due-parts-reminders')
  @ApiOperation({ summary: 'Find Due Parts Reminders' })
  getDuePartsReminders(
    @UserFilter() { vehicleId, currentOdo }: UserFilterType,
  ) {
    return this.partsChangedService.getDuePartsReminders(vehicleId, currentOdo);
  }

  @Get('part/:id')
  @ApiOperation({ summary: 'Find parts changed by part id' })
  async findByPartId(
    @Param() { id }: IdDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    return this.partsChangedService.findOne(
      { part: { id }, userId },
      partsChangedSelectFields,
      partsChangedRelations,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find parts changed by id' })
  async findOne(
    @Param() { id }: IdDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    return this.partsChangedService.findOne({ id, userId }, []);
  }

  @Post()
  async create(
    @Body() body: CreatePartsChangedDTO,
    @GetUser() user: LoggedInUser,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      user.id,
      user.defaultVehicleId,
      SharedVehiclePermissionENUM.EDIT,
    );
    return this.partsChangedService.create(body, user);
  }

  @Patch(':id')
  async update(
    @Param() { id }: IdDTO,
    @Body() body: UpdatePartsChangedDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    await this.vehicleAccessHelper.validateAccess(
      userId,
      vehicleId,
      SharedVehiclePermissionENUM.VIEW,
    );
    return this.partsChangedService.update(id, body);
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
    return this.partsChangedService.delete(id);
  }
}
