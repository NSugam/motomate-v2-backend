import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFillupsDTO {
  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 100 })
  @IsNotEmpty()
  @IsNumber()
  fuelCost: number;

  @ApiProperty({ example: 500 })
  @IsNotEmpty()
  @IsNumber()
  totalCost: number;

  @ApiProperty({ example: 12500 })
  @IsNotEmpty()
  @IsNumber()
  odoReading: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isPartial?: boolean;

  @ApiPropertyOptional({ example: 'Jadibuti' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: '2026-03-13' })
  @IsNotEmpty()
  @IsString()
  englishDate: string;
}

export class UpdateFillupsDTO extends CreateFillupsDTO {}
