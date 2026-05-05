import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDTO {
  @ApiProperty({ example: 'Bajaj' })
  @IsString()
  brand: string;

  @ApiProperty({ example: 'Pulsar NS160' })
  @IsString()
  model: string;

  @ApiPropertyOptional({ example: 'BA-1-CHA-1234' })
  @IsOptional()
  @IsString()
  licensePlate?: string;

  @ApiProperty({ example: '1' })
  @IsString()
  masterDataId: string;

  @ApiProperty({ example: 160 })
  @IsNumber()
  cc: number;

  @ApiProperty({ example: 6000 })
  @IsNumber()
  odoReading: number;

  @ApiProperty({ example: '2025' })
  @IsString()
  year: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  afe?: number;

  @ApiProperty({ example: '2025-07-11' })
  @IsString()
  englishDate: string;
}

export class UpdateVehicleDTO extends PartialType(CreateVehicleDTO) {}
