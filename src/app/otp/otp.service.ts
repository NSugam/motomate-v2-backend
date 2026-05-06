import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { otpTypeENUM } from 'src/common/common.enum';
import { generateOTP } from 'src/helper/otp.generator';
import { Repository } from 'typeorm';
import {
  generateOTPTemplate,
  generateWelcomeTemplate,
} from '../mailing-service/email.templates';
import { MailingService } from '../mailing-service/mailing-service.service';
import { User } from '../user/entities/user.entity';
import { GenerateOtpDTO, VerifyOtpDTO } from './dto/otp.dto';
import { OTP } from './entities/otp.entity';

@Injectable()
export class OTPService {
  constructor(
    @InjectRepository(OTP)
    private readonly otpRepo: Repository<OTP>,
    private readonly mailingService: MailingService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async generateOTP(body: GenerateOtpDTO) {
    const user = await this.userRepo.findOneBy({ email: body.email });
    if (!user) throw new NotFoundException('User not found.');

    if (body.type === otpTypeENUM.EMAIL && user.verified)
      throw new ConflictException('Email aready verified.');

    if (body.type === otpTypeENUM.PHONE && user.phoneVerified)
      throw new ConflictException('Phone number aready verified.');

    // Delete existing OTP
    await this.otpRepo.delete({
      userId: user.id,
      type: body.type,
    });

    const otpCode = generateOTP(6);
    if (body.type === otpTypeENUM.EMAIL) {
      await this.mailingService.sendMail({
        email: user.email,
        subject: 'Verify Your Motomate Account',
        message: generateOTPTemplate(user.fullname, otpCode),
      });
    }
    if (body.type === otpTypeENUM.PASSWORD_RESET) {
      await this.mailingService.sendMail({
        email: user.email,
        subject: 'Reset Your Motomate Password',
        message: generateOTPTemplate(user.fullname, otpCode),
      });
    }
    if (body.type === otpTypeENUM.PHONE) {
      throw new NotFoundException('404');
    }

    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15);
    const data = this.otpRepo.create({
      userId: user.id,
      otpCode,
      type: body.type,
      expiryTime,
    });

    await this.otpRepo.save(data);
    return { message: `OTP sent to ${body.type as string}` };
  }

  async verifyOTP(body: VerifyOtpDTO) {
    const user = await this.userRepo.findOneBy({ email: body.email });
    if (!user) throw new NotFoundException('User not found.');

    const otpData = await this.otpRepo.findOneBy({
      userId: user.id,
      type: body.type,
    });
    if (!otpData) throw new NotFoundException('Please generate otp first.');

    const currentTime = new Date();

    // Check expiry
    if (otpData.expiryTime < currentTime) {
      await this.otpRepo.delete(otpData.id);
      throw new BadRequestException('OTP has been expired.');
    }

    // Check attempts
    if (otpData.attemptsRemaining <= 0) {
      await this.otpRepo.delete(otpData.id);
      throw new BadRequestException('OTP attempts exceeded.');
    }

    // Verify OTP
    if (body.otpCode !== otpData.otpCode) {
      otpData.attemptsRemaining -= 1;
      await this.otpRepo.save(otpData);
      throw new BadRequestException(
        `Invalid OTP. Remaining attempt: ${otpData.attemptsRemaining}`,
      );
    }

    // Success
    if (body.type === otpTypeENUM.EMAIL) user.verified = true;
    if (body.type === otpTypeENUM.PHONE) user.phoneVerified = true;

    if (body.type === otpTypeENUM.PASSWORD_RESET) {
      if (
        body.newPassword &&
        body.confirmPassword &&
        body.newPassword !== body.confirmPassword
      ) {
        throw new BadRequestException('Passwords do not match.');
      }
      if (!user) throw new NotFoundException('User not found.');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(body.newPassword, salt);
      user.password = hashedPassword;
    }

    await this.otpRepo.delete(otpData.id);
    await this.userRepo.save(user);

    await this.mailingService.sendMail({
      email: user.email,
      subject: 'Your Account Is Successfully Verified',
      message: generateWelcomeTemplate(user.fullname),
    });

    return { message: 'OTP verified successfully.' };
  }
}
