import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ResetDeviceDTO {
  @ApiProperty({ example: 'sugam@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ example: 'ABC123' })
  @IsNotEmpty()
  @IsString()
  otpCode: string;
}
