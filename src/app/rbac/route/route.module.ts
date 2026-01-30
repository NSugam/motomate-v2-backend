import { Module } from '@nestjs/common';
import { RouteService } from './route.service';
import { RouteController } from './route.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { routesEntity } from './entities/route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([routesEntity])],
  controllers: [RouteController],
  providers: [RouteService],
})
export class RouteModule {}
