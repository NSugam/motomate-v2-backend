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
import { ILike } from 'typeorm';
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
  constructor(private readonly partsChangedService: PartsChangedService) {}

  @Get()
  findAll(
    @Query()
    { searchTerm, fromServicing, ...pagination }: PartsChangedFilterDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    const filter: OrmWhereType<PartsChanged> = { userId, vehicleId };
    if (searchTerm) filter.part = { name: ILike(`%${searchTerm}%`) };
    if (fromServicing !== undefined) filter.fromServicing = fromServicing;

    return this.partsChangedService.findAndCountWithTotal(
      filter,
      partsChangedSelectFields,
      pagination,
      {
        createdAt: 'DESC',
      },
      partsChangedRelations,
    );
  }

  @Get('last-serviced')
  @ApiOperation({ summary: 'Find Last Parts Changed from Servicing' })
  getLatestPartsChanged(
    @Query()
    { fromServicing }: PartsChangedFilterDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    return this.partsChangedService.getLatestServicingParts(
      userId,
      vehicleId,
      fromServicing,
    );
  }

  @Get('part/:id')
  @ApiOperation({ summary: 'Find parts changed by part id' })
  findByPartId(
    @Param() { id }: IdDTO,
    @UserFilter() { userId }: UserFilterType,
  ) {
    return this.partsChangedService.findOne(
      { part: { id }, userId },
      partsChangedSelectFields,
      partsChangedRelations,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find parts changed by id' })
  findOne(@Param() { id }: IdDTO, @UserFilter() { userId }: UserFilterType) {
    return this.partsChangedService.findOne({ id, userId }, []);
  }

  @Post()
  create(@Body() body: CreatePartsChangedDTO, @GetUser() user: LoggedInUser) {
    return this.partsChangedService.create(body, user);
  }

  @Patch(':id')
  update(
    @Param() { id }: IdDTO,
    @Body() body: UpdatePartsChangedDTO,
    @UserFilter() { userId }: UserFilterType,
  ) {
    return this.partsChangedService.update(id, body, userId);
  }

  @Delete(':id')
  delete(@Param() { id }: IdDTO, @UserFilter() { userId }: UserFilterType) {
    return this.partsChangedService.delete(id, userId);
  }
}
