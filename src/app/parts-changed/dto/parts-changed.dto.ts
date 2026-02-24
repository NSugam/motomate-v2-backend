import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePartsChangedDTO {
  @ApiPropertyOptional({ example: '1', description: 'Servicing ID' })
  @IsOptional()
  @IsString()
  servicingId: string;

  @ApiProperty({ example: '1', description: 'Part ID' })
  @IsNotEmpty()
  @IsString()
  partId: string;

  @ApiProperty({ example: '2025-02-02', description: 'English Date' })
  @IsNotEmpty()
  @IsString()
  englishDate: string;

  @ApiProperty({ example: 12000, required: false })
  @IsOptional()
  @IsNumber()
  odoReading?: number;

  @ApiProperty({ example: 1500.5, required: false })
  @IsOptional()
  @IsNumber()
  cost?: number;
}

export class UpdatePartsChangedDTO extends PartialType(CreatePartsChangedDTO) {}
