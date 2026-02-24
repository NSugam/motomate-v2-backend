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
import { CreatePartDTO, UpdatePartDTO } from './dto/part.dto';
import { Part } from './entities/part.entity';
import { PartService } from './part.service';

@Controller('part')
export class PartController {
  constructor(private readonly partService: PartService) {}

  @Get()
  findAll(
    @Query() { searchTerm, ...pagination }: optionalPagiSearchTermDTO,
    @UserFilter() { userId }: UserFilterType,
  ) {
    const filter: OrmWhereType<Part> = { userId };
    if (searchTerm) filter.name = ILike(`%${searchTerm}%`);
    return this.partService.findAndCount(filter, [], pagination, {
      createdAt: 'DESC',
    });
  }

  @Get(':id')
  findOne(@Param() { id }: IdDTO, @UserFilter() { userId }: UserFilterType) {
    return this.partService.findOne({ id, userId }, []);
  }

  @Post()
  create(@Body() body: CreatePartDTO, @GetUser() user: LoggedInUser) {
    return this.partService.create(body, user);
  }

  @Patch(':id')
  update(
    @Param() { id }: IdDTO,
    @Body() body: UpdatePartDTO,
    @UserFilter() { userId }: UserFilterType,
  ) {
    return this.partService.update(id, body, userId);
  }

  @Delete(':id')
  delete(@Param() { id }: IdDTO, @UserFilter() { userId }: UserFilterType) {
    return this.partService.delete(id, userId);
  }
}
