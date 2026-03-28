import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceReminder } from '../service-reminder/entities/service-reminder.entity';
import { User } from '../user/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    CacheModule.register(),
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, ServiceReminder]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [PassportModule],
})
export class AuthModule {}
