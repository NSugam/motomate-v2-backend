import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class GenerateBikesDataDTO {
  @ApiProperty({ description: 'The company of the bike', example: 'Bajaj' })
  @IsString()
  @IsNotEmpty()
  make: string;

  @ApiPropertyOptional({
    description: 'The model of the bike',
    example: 'Pulsar',
  })
  @IsString()
  @IsOptional()
  model: string;
}
