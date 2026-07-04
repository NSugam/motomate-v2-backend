import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedVehicle } from 'src/app/shared-vehicle/entities/shared-vehicle.entity';
import { Vehicle } from 'src/app/vehicle/entities/vehicle.entity';
import { VehicleAccessHelper } from './vehicle-access.helper';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, SharedVehicle])],
  providers: [VehicleAccessHelper],
  exports: [VehicleAccessHelper],
})
export class VehicleAccessModule {}
