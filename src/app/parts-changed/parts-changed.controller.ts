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
import { ApiOperation } from '@nestjs/swagger';

@Controller('parts-changed')
export class PartsChangedController {
  constructor(private readonly partsChangedService: PartsChangedService) {}

  @Get()
  findAll(
    @Query()
    { searchTerm, fromServicing, ...pagination }: PartsChangedFilterDTO,
    @UserFilter() { userId }: UserFilterType,
  ) {
    const filter: OrmWhereType<PartsChanged> = { userId };
    if (searchTerm) filter.part = { name: ILike(`%${searchTerm}%`) };
    if (fromServicing !== undefined) filter.fromServicing = fromServicing;

    return this.partsChangedService.findAndCount(
      filter,
      partsChangedSelectFields,
      pagination,
      {
        createdAt: 'DESC',
      },
      partsChangedRelations,
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
