import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Sugam Neupane' })
  @IsOptional()
  @IsString()
  fullname: string;

  @ApiPropertyOptional({ example: 'sugam@gmail.com' })
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '9850930099' })
  @IsOptional()
  @IsString()
  phone: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  defaultVehicleId: string;

  @ApiPropertyOptional({ example: 'ExponentPushToken[axnakjkasddfopk]' })
  @IsOptional()
  @IsString()
  ExpoToken: string;
}
export class ChangePasswordDTO {
  @ApiProperty({ example: 'sugam123' })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'sujal248' })
  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @ApiProperty({ example: 'sujal248' })
  @IsNotEmpty()
  @IsString()
  confirmNewPassword: string;
}
