import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleModule } from '../vehicle/vehicle.module';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    VehicleModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
