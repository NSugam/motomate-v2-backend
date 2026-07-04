import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum SharedVehiclePermissionENUM {
  VIEW = 'VIEW',
  EDIT = 'EDIT',
}

export class CreateSharedVehicleDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vehicleId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sharedWithUserId: string;

  @ApiProperty({ enum: SharedVehiclePermissionENUM })
  @IsEnum(SharedVehiclePermissionENUM)
  permission: SharedVehiclePermissionENUM;
}

export class UpdateSharedVehicleDTO {
  @ApiPropertyOptional({ enum: SharedVehiclePermissionENUM })
  @IsEnum(SharedVehiclePermissionENUM)
  @IsOptional()
  permission?: SharedVehiclePermissionENUM;
}
