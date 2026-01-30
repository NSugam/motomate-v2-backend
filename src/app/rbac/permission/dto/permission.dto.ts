import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum PermissionType {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
}

export class CreatePermissionDto {
  @ApiProperty({
    example: PermissionType.POST,
    enum: PermissionType,
    description: 'Type of permission (HTTP method)',
  })
  @IsNotEmpty()
  @IsEnum(PermissionType, {
    message: 'Permission must be one of get, post, patch or delete',
  })
  name: PermissionType;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
