import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { otpTypeENUM } from 'src/common/common.enum';

export class GenerateOtpDTO {
  @ApiProperty({ example: 'sugam@gmail.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ enum: otpTypeENUM, example: otpTypeENUM.EMAIL })
  @IsNotEmpty()
  @IsString()
  @IsEnum(otpTypeENUM)
  type: otpTypeENUM;
}

export class VerifyOtpDTO {
  @ApiProperty({ example: 'sugam@gmail.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ enum: otpTypeENUM, example: otpTypeENUM.EMAIL })
  @IsNotEmpty()
  @IsString()
  @IsEnum(otpTypeENUM)
  type: otpTypeENUM;

  @ApiProperty({ example: '123456' })
  @IsNotEmpty()
  @IsString()
  otpCode: string;

  @ApiPropertyOptional({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @ApiPropertyOptional({ example: 'password123' })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}

export class UpdateOTPDTO extends PartialType(GenerateOtpDTO) {}
