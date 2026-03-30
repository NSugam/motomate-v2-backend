import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDTO {
  @ApiPropertyOptional({
    example: 'ExponentPushToken[xxxxxxxx]',
    description: 'Expo push token',
  })
  @IsOptional()
  @IsString()
  expoToken: string;

  @ApiProperty({
    example: 'Notification Title',
    description: 'Notification title',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Notification Body Description',
    description: 'Notification body',
  })
  @IsNotEmpty()
  @IsString()
  body: string;
}
