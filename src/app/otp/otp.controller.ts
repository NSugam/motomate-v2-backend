import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { GenerateOtpDTO, VerifyOtpDTO } from './dto/otp.dto';
import { OTPService } from './otp.service';

@Controller('otp')
@UseGuards(ThrottlerGuard)
export class OTPController {
  constructor(private readonly otpService: OTPService) {}

  @Post('generate')
  @Throttle({ default: { limit: 3, ttl: 5 * 60 * 1000 } }) // 3 request per 5 mins
  generateOTP(@Body() body: GenerateOtpDTO) {
    return this.otpService.generateOTP(body);
  }

  @Post('verify')
  verifyOTP(@Body() body: VerifyOtpDTO) {
    return this.otpService.verifyOTP(body);
  }
}
