import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vehicle } from '../vehicle/entities/vehicle.entity';
import { SharedVehicle } from './entities/shared-vehicle.entity';
import { SharedVehicleController } from './shared-vehicle.controller';
import { SharedVehicleService } from './shared-vehicle.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, SharedVehicle])],
  controllers: [SharedVehicleController],
  providers: [SharedVehicleService],
})
export class SharedVehicleModule {}
