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
  constructor(private readonly servicingService: ServicingService) {}

  @Post()
  create(@Body() body: CreateServicingDTO, @GetUser() user: LoggedInUser) {
    return this.servicingService.create(body, user);
  }

  @Get()
  findAll(
    @Query() { searchTerm, vehicleIdFilter, ...pagination }: ServicingFilter,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    const filter: OrmWhereType<Servicing> = { userId, vehicleId };

    if (searchTerm) filter.location = ILike(`%${searchTerm}%`);
    if (vehicleIdFilter) filter.vehicleId = vehicleIdFilter;

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
  findOne(@Param() { id }: IdDTO, @UserFilter() { userId }: UserFilterType) {
    return this.servicingService.findOne(
      { id, userId },
      servicingSelectWithRelation,
      servicingRelations,
    );
  }

  @Patch(':id')
  update(
    @Param() { id }: IdDTO,
    @Body() body: UpdateServicingDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    return this.servicingService.update(id, body, userId, vehicleId);
  }

  @Delete(':id')
  delete(@Param() { id }: IdDTO, @UserFilter() { userId }: UserFilterType) {
    return this.servicingService.delete(id, userId);
  }
}
