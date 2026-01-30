import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FailOnFoundFn,
  FindAndCountFn,
  FindManyFn,
  FindOneFn,
  FindOrFailFn,
} from 'src/common/orm.type';
import { generateTakeSkip } from 'src/helper/utils';
import { Repository } from 'typeorm';
import { CreateRouteDTO, UpdateRouteDTO } from './dto/route.dto';
import { routesEntity } from './entities/route.entity';

@Injectable()
export class RouteService {
  constructor(
    @InjectRepository(routesEntity)
    private readonly routeRepo: Repository<routesEntity>,
  ) {}

  async create(body: CreateRouteDTO) {
    await this.routeRepo.save(this.routeRepo.create({ ...body }));
    return { message: 'Route Created Successfully' };
  }

  findOne: FindOneFn<routesEntity> = (where, select, relations) =>
    this.routeRepo.findOne({ where, select, relations });

  findOrFail: FindOrFailFn<routesEntity> = (where, select, relations) =>
    this.routeRepo.findOneOrFail({ where, select, relations });

  failOnFound: FailOnFoundFn<routesEntity> = async (where, relations) => {
    const data = await this.findOne(where, ['name'], relations);
    if (data) throw new Error(`Route Already Exists With Name ${data.name}`);
  };

  findMany: FindManyFn<routesEntity> = (w, s, o, r) =>
    this.routeRepo.find({ where: w, select: s, relations: r, order: o });

  findAndCount: FindAndCountFn<routesEntity> = (w, s, p, o, r) => {
    const { take, skip } = generateTakeSkip(p);
    return this.routeRepo.findAndCount({
      where: w,
      select: s,
      relations: r,
      order: o,
      take,
      skip,
    });
  };

  async update(name: string, payload: UpdateRouteDTO) {
    const data = await this.findOrFail({ name }, []);
    const updated = this.routeRepo.merge(data, payload);
    await this.routeRepo.update(name, updated);
    return { message: 'Route Updated Successfully' };
  }

  async delete(name: string) {
    await this.findOrFail({ name }, []);
    await this.routeRepo.softDelete(name);
    return { message: 'Route Deleted Successfully' };
  }
}
