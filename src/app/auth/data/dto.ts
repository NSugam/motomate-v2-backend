import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'admin@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: true, type: 'boolean' })
  @IsOptional()
  @IsNotEmpty()
  rememberMe: boolean;
}

export class CreateUserDto {
  @ApiProperty({ example: 'Sugam Neupane' })
  @IsString()
  fullname: string;

  @ApiProperty({ example: 'ns.neupane09' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'Default user' })
  @IsNotEmpty()
  @IsString()
  position: string;
}
