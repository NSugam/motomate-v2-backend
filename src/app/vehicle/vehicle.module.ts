import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fillups } from '../fillups/entities/fillup.entity';
import { ServiceReminder } from '../service-reminder/entities/service-reminder.entity';
import { UploadModule } from '../upload/upload.module';
import { User } from '../user/entities/user.entity';
import { Vehicle } from './entities/vehicle.entity';
import { VehicleController } from './vehicle.controller';
import { VehicleService } from './vehicle.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vehicle, User, ServiceReminder, Fillups]),
    UploadModule,
  ],
  controllers: [VehicleController],
  providers: [VehicleService],
  exports: [VehicleService],
})
export class VehicleModule {}
