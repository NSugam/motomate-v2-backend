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
import { ILike } from 'typeorm';
import { CreateFillupsDTO, UpdateFillupsDTO } from './dto/fillups.dto';
import { Fillups } from './entities/fillup.entity';
import { FillupsService } from './fillups.service';

@Controller('fillups')
export class FillupsController {
  constructor(private readonly fillupsService: FillupsService) {}

  @Get()
  findAll(
    @Query() { searchTerm, ...pagination }: optionalPagiSearchTermDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    const filter: OrmWhereType<Fillups> = { userId, vehicleId };

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
  findOne(
    @Param() { id }: IdDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    return this.fillupsService.findOne({ id, userId, vehicleId }, []);
  }

  @Post()
  create(
    @Body() body: CreateFillupsDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    return this.fillupsService.create(body, { userId, vehicleId });
  }

  @Patch(':id')
  update(
    @Body() body: UpdateFillupsDTO,
    @Param() { id }: IdDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    return this.fillupsService.update(id, { userId, vehicleId }, body);
  }

  @Delete(':id')
  delete(
    @Param() { id }: IdDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    return this.fillupsService.delete(id, { userId, vehicleId });
  }
}
