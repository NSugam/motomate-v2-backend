import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailingServiceModule } from '../mailing-service/mailing-service.module';
import { User } from '../user/entities/user.entity';
import { OTP } from './entities/otp.entity';
import { OTPController } from './otp.controller';
import { OTPService } from './otp.service';

@Module({
  imports: [TypeOrmModule.forFeature([OTP, User]), MailingServiceModule],
  controllers: [OTPController],
  providers: [OTPService],
})
export class OTPModule {}
