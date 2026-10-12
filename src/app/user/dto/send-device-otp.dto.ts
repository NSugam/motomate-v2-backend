import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendDeviceOtpDTO {
  @ApiProperty({ example: 'sugam@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  emailId: string;
}
