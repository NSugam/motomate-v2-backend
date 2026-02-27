// parts-reminder.dto.ts
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsDefined,
  IsEnum,
  IsInt,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ReminderTypeENUM } from './reminder.types';

export class CreatePartsReminderDTO {
  @ApiProperty({
    example: '1',
  })
  @IsString()
  partId: string;

  @ApiProperty({ enum: ReminderTypeENUM })
  @IsEnum(ReminderTypeENUM)
  type: ReminderTypeENUM;

  @ApiPropertyOptional({ example: 2000 })
  @ValidateIf(
    (o: CreatePartsReminderDTO) =>
      o.type === ReminderTypeENUM.ODO || o.type === ReminderTypeENUM.BOTH,
  )
  @IsDefined({
    message: 'odoInterval is required for ODO or BOTH reminder type',
  })
  @IsInt()
  odoInterval?: number;

  @ApiPropertyOptional({ example: 30 })
  @ValidateIf(
    (o: CreatePartsReminderDTO) =>
      o.type === ReminderTypeENUM.DATE || o.type === ReminderTypeENUM.BOTH,
  )
  @IsDefined({
    message: 'dateInterval is required for DATE or BOTH reminder type',
  })
  @IsInt()
  dateInterval?: number;
}

export class UpdatePartsReminderDTO extends PartialType(
  CreatePartsReminderDTO,
) {}
