import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateServicingDTO {
  @ApiProperty({ example: 'Kathmandu Workshop' })
  @IsString()
  location: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  counter: number;

  @ApiProperty({ example: 1800 })
  @IsNumber()
  totalCost: number;

  @ApiProperty({ example: '2024-06-23' })
  @IsString()
  englishDate: string;

  @ApiProperty({ example: '२०८१ असार ९' })
  @IsString()
  nepaliDate: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  odoReading: number;

  @ApiProperty({ example: ['1', '2'] })
  @IsArray()
  partsChangedIds: string[];

  @ApiPropertyOptional({ example: 'N/A' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateServicingDTO extends PartialType(CreateServicingDTO) {}
