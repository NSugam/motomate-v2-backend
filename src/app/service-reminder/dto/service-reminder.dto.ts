// parts-reminder.dto.ts
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  ValidateIf,
} from 'class-validator';
import { ReminderTypeENUM } from './reminder.types';

export class CreateServiceReminderDTO {
  @ApiProperty({ enum: ReminderTypeENUM })
  @IsEnum(ReminderTypeENUM)
  type: ReminderTypeENUM;

  @ApiPropertyOptional({ example: 2000 })
  @ValidateIf(
    (o: CreateServiceReminderDTO) =>
      o.type === ReminderTypeENUM.ODO || o.type === ReminderTypeENUM.BOTH,
  )
  @IsDefined({
    message: 'odoInterval is required for ODO or BOTH reminder type',
  })
  @IsInt()
  odoInterval?: number;

  @ApiPropertyOptional({ example: 30 })
  @ValidateIf(
    (o: CreateServiceReminderDTO) =>
      o.type === ReminderTypeENUM.DATE || o.type === ReminderTypeENUM.BOTH,
  )
  @IsDefined({
    message: 'dateInterval is required for DATE or BOTH reminder type',
  })
  @IsInt()
  dateInterval?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Disable notifications for this reminder',
  })
  @IsBoolean()
  isDisabled?: boolean;
}

export class UpdateServiceReminderDTO extends PartialType(
  CreateServiceReminderDTO,
) {}
