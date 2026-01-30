import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class sendMailDto {
  @ApiProperty({
    description: 'Receiver email address',
    example: 'nsugam248@gmail.com',
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
