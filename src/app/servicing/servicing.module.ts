import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartsChanged } from '../parts-changed/entities/parts-changed.entity';
import { VehicleModule } from '../vehicle/vehicle.module';
import { Servicing } from './entities/servicing.entity';
import { ServicingController } from './servicing.controller';
import { ServicingService } from './servicing.service';

@Module({
  imports: [TypeOrmModule.forFeature([Servicing, PartsChanged]), VehicleModule],
  controllers: [ServicingController],
  providers: [ServicingService],
})
export class ServicingModule {}
