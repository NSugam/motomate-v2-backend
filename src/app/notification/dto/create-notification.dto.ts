import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export enum NotificationTypeENUM {
  SERVICE_REMINDER = 'SERVICE_REMINDER',
  INSURANCE_DUE = 'INSURANCE_DUE',
  SYSTEM = 'SYSTEM',
  GENERAL = 'GENERAL',
}

export class CreateNotificationDTO {
  @ApiProperty({
    example: 'Notification Title',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Notification Body Description',
  })
  @IsNotEmpty()
  @IsString()
  body: string;

  @ApiProperty({
    example: NotificationTypeENUM.SERVICE_REMINDER,
    enum: NotificationTypeENUM,
  })
  @IsNotEmpty()
  @IsEnum(NotificationTypeENUM)
  type: NotificationTypeENUM;

  @ApiPropertyOptional({
    example: { vehicleId: '123', nextOdo: 12000 },
    description: 'Optional metadata for notification context',
  })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;
}
