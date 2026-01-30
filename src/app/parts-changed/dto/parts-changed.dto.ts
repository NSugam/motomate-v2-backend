import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePartsChangedDTO {
  @ApiProperty({ example: 'Engine Oil' })
  @IsNotEmpty()
  @IsString()
  partName: string;

  @ApiProperty({ example: '1200', type: 'string' })
  @IsNotEmpty()
  @IsString()
  cost: number;
}

export class UpdatePartsChangedDTO extends PartialType(CreatePartsChangedDTO) {}
