import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { optionalPagiSearchTermDTO } from 'src/common/dto';

export class PartsChangedFilterDTO extends optionalPagiSearchTermDTO {
  @ApiPropertyOptional({
    default: false,
    description: 'Parts from servicing or not',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  fromServicing?: boolean;

  @ApiPropertyOptional({
    default: false,
    description: 'Check if the part has a reminder or not',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  checkReminder?: boolean;
}
