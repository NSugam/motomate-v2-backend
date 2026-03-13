import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class PartsChangedInputDTO {
  @ApiProperty({ example: '1', description: 'Part ID' })
  @IsString()
  partId: string;

  @ApiProperty({
    required: false,
    example: 500,
  })
  @IsOptional()
  @IsNumber()
  cost?: number;
}

export class CreateServicingDTO {
  @ApiProperty({ example: 'Kathmandu Workshop' })
  @IsString()
  location: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  counter: number;

  @ApiProperty({ example: 1800 })
  @IsNumber()
  servicingCost: number;

  @ApiProperty({ example: '2024-06-23' })
  @IsString()
  englishDate: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  odoReading: number;

  @ApiPropertyOptional({ example: 'N/A' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiProperty({ type: [PartsChangedInputDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartsChangedInputDTO)
  partsChanged: PartsChangedInputDTO[];
}

class PartsChangedUpdateDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty()
  @IsString()
  partId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  cost?: number;
}

export class UpdateServicingDTO extends PartialType(CreateServicingDTO) {
  @ApiProperty({ type: [PartsChangedUpdateDTO], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartsChangedUpdateDTO)
  partsChanged?: PartsChangedUpdateDTO[];
}
