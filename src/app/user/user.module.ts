import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadModule } from '../upload/upload.module';
import { VehicleModule } from '../vehicle/vehicle.module';
import { UserDevice } from './entities/user.device.entity';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule,
    TypeOrmModule.forFeature([User, UserDevice]),
    VehicleModule,
    UploadModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
