import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class RbacDto {
  @ApiPropertyOptional({ description: 'Role Name', example: 'admin' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ description: 'Route Name', example: 'user' })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional({
    description: 'Permission: get | post | patch | delete',
    example: 'get',
  })
  @IsOptional()
  @IsString()
  permission?: string;
}

export class BulkRbacDto {
  @ApiProperty({ type: [RbacDto] })
  @IsArray()
  items: RbacDto[];
}

export class BulkDeleteRbacDto {
  @ApiProperty({
    description: 'List of RBAC record IDs to delete',
    example: [
      '7a1b9c3e-1d2f-4e5a-9b8c-123456789abc',
      '9f2e1a7b-3c4d-5e6f-8a9b-abcdef123456',
    ],
    type: [String],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  ids: string[];
}
