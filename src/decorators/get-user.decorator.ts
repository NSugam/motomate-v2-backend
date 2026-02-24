import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/app/user/entities/user.entity';
import { UserRoleENUM } from 'src/app/user/user.type';
import { RequestWithRequiredUser } from 'src/config/CustomRequest';

export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithRequiredUser>();
    return request.user; // return only user object
  },
);

export const UserFilter = createParamDecorator(
  (
    _data: unknown,
    ctx: ExecutionContext,
  ): { userId: string | null; vehicleId: string | null } => {
    const request = ctx.switchToHttp().getRequest<RequestWithRequiredUser>();

    let userId: string | null = null;
    let vehicleId: string | null = null;

    if (request.user.role === UserRoleENUM.SUPER_ADMIN) {
      userId = null;
      vehicleId = null;
    } else {
      userId = request.user.id;
      vehicleId = request.user.defaultVehicleId;
    }

    // return ids if not super admin
    return { userId, vehicleId };
  },
);
