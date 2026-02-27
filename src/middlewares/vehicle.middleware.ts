import {
  BadGatewayException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { RequestWithUser } from 'src/config/CustomRequest';
import { UserRoleENUM } from '../app/user/user.type';

@Injectable()
export class VehicleMiddleware implements NestMiddleware {
  private publicPaths: string[] = ['user/me:get', 'vehicle:post'];

  use(req: RequestWithUser, _res: Response, next: NextFunction) {
    const user = req?.user;

    const url = req.originalUrl.split('?')[0];
    const path = url.replace(/^\/api\//, '');
    const action = req.method.toLowerCase();
    const key = `${path}:${action}`;

    // Allow public paths
    if (this.publicPaths.includes(key)) return next();

    if (!user)
      throw new UnauthorizedException('Unauthorized: Invalid User Credentials');

    if (
      user.role !== UserRoleENUM.SUPER_ADMIN &&
      user.defaultVehicleId === null
    )
      throw new BadGatewayException(
        'BadRequest: Please select a default vehicle',
      );

    if (user.vehicles.length >= 3) {
      throw new UnauthorizedException('Trial: You can only have 3 vehicles');
    }

    next();
  }
}
