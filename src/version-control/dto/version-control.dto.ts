import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVersionControlDTO {
  @ApiProperty({ example: 'motomate' })
  @IsNotEmpty()
  @IsString()
  app: string;

  @ApiProperty({ example: 'stable' })
  @IsNotEmpty()
  @IsString()
  buildType: string;

  @ApiProperty({ example: '4.0.3' })
  @IsNotEmpty()
  @IsString()
  version: string;

  @ApiProperty({ example: '403' })
  @IsNotEmpty()
  @IsString()
  versionCode: string;

  @ApiPropertyOptional({
    example:
      'Fixed crashing issue while selecting vehicle model and while updating default vehicle.',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateVersionControlDTO extends PartialType(
  CreateVersionControlDTO,
) {}
