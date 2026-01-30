import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

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
}
