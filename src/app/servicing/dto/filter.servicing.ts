import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { optionalPagiSearchTermDTO } from 'src/common/dto';

export class ServicingFilter extends optionalPagiSearchTermDTO {
  @ApiProperty({ example: '1', description: 'Vehicle Id' })
  @IsString()
  vehicleId: string;
}
