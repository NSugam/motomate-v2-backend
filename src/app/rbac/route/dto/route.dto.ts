import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRouteDTO {
  @ApiProperty({ example: 'user' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateRouteDTO extends PartialType(CreateRouteDTO) {}
