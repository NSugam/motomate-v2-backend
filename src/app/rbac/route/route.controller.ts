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
import { IdDTO, optionalPagiSearchTermDTO } from 'src/common/dto';
import { OrmWhereType } from 'src/common/orm.type';
import { ILike } from 'typeorm';
import { CreateRouteDTO, UpdateRouteDTO } from './dto/route.dto';
import { routesEntity } from './entities/route.entity';
import { RouteService } from './route.service';

@Controller('routes')
export class RouteController {
  constructor(private readonly routeService: RouteService) {}

  @Get()
  findAll(@Query() { searchTerm, ...query }: optionalPagiSearchTermDTO) {
    const filter: OrmWhereType<routesEntity> = {};
    if (searchTerm) filter.name = ILike(`%${searchTerm}%`);

    return this.routeService.findAndCount(filter, [], query, { name: 'ASC' });
  }

  @Get(':id')
  findOne(@Param() { id }: IdDTO) {
    return this.routeService.findOne({ name: id }, ['rolePermissions']);
  }

  @Post()
  create(@Body() body: CreateRouteDTO) {
    return this.routeService.create(body);
  }

  @Patch(':id')
  update(@Body() body: UpdateRouteDTO, @Param() { id }: IdDTO) {
    return this.routeService.update(id, body);
  }

  @Delete(':id')
  delete(@Param() { id }: IdDTO) {
    return this.routeService.delete(id);
  }
}
