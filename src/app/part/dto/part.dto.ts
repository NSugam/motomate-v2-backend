import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePartDTO {
  @ApiProperty({ example: 'Brake Pad' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Front brake pad', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePartDTO extends PartialType(CreatePartDTO) {}
