// parts-reminder.dto.ts
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { ReminderTypeENUM } from './reminder.types';

export class CreatePartsReminderDTO {
  @ApiProperty({
    description: 'ID of the part to link this reminder to',
    example: 1,
  })
  @IsString()
  partId: string;

  @ApiProperty({ enum: ReminderTypeENUM })
  @IsEnum(ReminderTypeENUM)
  type: ReminderTypeENUM;

  @ApiPropertyOptional({
    example: 2000,
  })
  @IsInt()
  @IsOptional()
  odoInterval?: number;

  @ApiPropertyOptional({
    example: 30,
  })
  @IsInt()
  @IsOptional()
  dateInterval?: number;
}

export class UpdatePartsReminderDTO extends PartialType(
  CreatePartsReminderDTO,
) {}
