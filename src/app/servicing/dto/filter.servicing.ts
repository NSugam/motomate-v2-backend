import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { optionalPagiSearchTermDTO } from 'src/common/dto';

export class ServicingFilter extends optionalPagiSearchTermDTO {
  @ApiPropertyOptional({ example: '1', description: 'Vehicle Id' })
  @IsOptional()
  @IsString()
  vehicleIdFilter?: string;
}
