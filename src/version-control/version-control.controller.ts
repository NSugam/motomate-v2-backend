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

import { IdDTO, optionalPagiSearchTermDTO } from 'src/common/dto';
import { OrmWhereType } from 'src/common/orm.type';
import {
  CreateVersionControlDTO,
  UpdateVersionControlDTO,
} from './dto/version-control.dto';
import { VersionControl } from './entities/version-control.entity';
import { VersionControlService } from './version-control.service';

@Controller('version-control')
export class VersionControlController {
  constructor(private readonly service: VersionControlService) {}

  @Get()
  findAll(@Query() { searchTerm, ...pagination }: optionalPagiSearchTermDTO) {
    const filter: OrmWhereType<VersionControl> = {};
    if (searchTerm) filter.app = ILike(`%${searchTerm}%`);

    return this.service.findAndCount(
      filter,
      [],
      pagination,
      { createdAt: 'DESC' },
      [],
    );
  }

  @Get('latest')
  findLatest() {
    return this.service.findLatest();
  }

  @Get(':id')
  findOne(@Param() { id }: IdDTO) {
    return this.service.findOrFail({ id });
  }

  @Post()
  create(@Body() body: CreateVersionControlDTO) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param() { id }: IdDTO, @Body() body: UpdateVersionControlDTO) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  delete(@Param() { id }: IdDTO) {
    return this.service.delete(id);
  }
}
