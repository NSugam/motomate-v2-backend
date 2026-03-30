import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fillups } from './entities/fillup.entity';
import { FillupsController } from './fillups.controller';
import { FillupsService } from './fillups.service';
import { VehicleModule } from '../vehicle/vehicle.module';

@Module({
  imports: [TypeOrmModule.forFeature([Fillups]), VehicleModule],
  controllers: [FillupsController],
  providers: [FillupsService],
})
export class FillupsModule {}
