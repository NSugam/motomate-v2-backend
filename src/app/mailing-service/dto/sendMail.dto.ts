import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class sendMailDto {
  @ApiProperty({
    description: 'Receiver email address',
    example: 'contact@neupanesugam.com.np',
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Subject', example: 'This is Subject' })
  @IsString()
  subject: string;

  @ApiProperty({ description: 'Message', example: 'This is the message' })
  @IsString()
  message: string;
}
