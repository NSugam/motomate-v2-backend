import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { optionalPagiSearchTermDTO } from 'src/common/dto';
import { UserRoleENUM } from '../user.type';

export class RoleDto extends optionalPagiSearchTermDTO {
  @ApiPropertyOptional({ enum: UserRoleENUM, default: UserRoleENUM.USER })
  @IsOptional()
  @IsEnum(UserRoleENUM, {
    message: 'Valid role required',
  })
  role?: UserRoleENUM;
}
