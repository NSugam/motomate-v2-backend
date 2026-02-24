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
import { IdDTO, optionalPagiSearchTermDTO } from '../../../src/common/dto';
import { OrmWhereType } from '../../../src/common/orm.type';
import {
  GetUser,
  UserFilter,
} from '../../../src/decorators/get-user.decorator';
import { ILike } from 'typeorm';
import { LoggedInUser } from '../user/user.type';
import {
  CreatePartsChangedDTO,
  UpdatePartsChangedDTO,
} from './dto/parts-changed.dto';
import { PartsChanged } from './entities/parts-changed.entity';
import { PartsChangedService } from './parts-changed.service';

@Controller('parts-changed')
export class PartsChangedController {
  constructor(private readonly partsChangedService: PartsChangedService) {}

  @Get()
  findAll(
    @Query() { searchTerm, ...pagination }: optionalPagiSearchTermDTO,
    @UserFilter() userId: string,
  ) {
    const filter: OrmWhereType<PartsChanged> = { userId };
    if (searchTerm) filter.partName = ILike(`%${searchTerm}%`);
    return this.partsChangedService.findAndCount(filter, [], pagination, {
      createdAt: 'DESC',
    });
  }

  @Get(':id')
  findOne(@Param() { id }: IdDTO, @UserFilter() userId: string) {
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
    @UserFilter() userId: string,
  ) {
    return this.partsChangedService.update(id, body, userId);
  }

  @Delete(':id')
  delete(@Param() { id }: IdDTO, @UserFilter() userId: string) {
    return this.partsChangedService.delete(id, userId);
  }
}
