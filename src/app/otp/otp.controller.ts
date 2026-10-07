import { Body, Controller, Post } from '@nestjs/common';
import { GenerateOtpDTO, VerifyOtpDTO } from './dto/otp.dto';
import { OTPService } from './otp.service';

@Controller('otp')
export class OTPController {
  constructor(private readonly otpService: OTPService) {}

  @Post('generate')
  generateOTP(@Body() body: GenerateOtpDTO) {
    return this.otpService.generateOTP(body);
  }

  @Post('verify')
  verifyOTP(@Body() body: VerifyOtpDTO) {
    return this.otpService.verifyOTP(body);
  }
}
