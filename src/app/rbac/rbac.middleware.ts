import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { rolePermissionEntity } from 'src/app/rbac/entities/rolePermission.entity';
import { RequestWithUser } from 'src/config/CustomRequest';
import { Repository } from 'typeorm';
import { ALL_USER, hardcodedPermissions } from './hardcodedPermissions';

@Injectable()
export class RbacMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(rolePermissionEntity)
    private readonly rbacEntity: Repository<rolePermissionEntity>,
  ) {}

  private publicPaths: string[] = ['user/profile'];

  async use(req: RequestWithUser, _res: Response, next: () => void) {
    const user = req.user;
    if (!user)
      throw new UnauthorizedException(
        'Unauthorized: Please login to continue.',
      );

    const role = user.role;
    if (!role)
      throw new UnauthorizedException(
        "Unauthorized: User's role not available",
      );

    const url = req.originalUrl.split('?')[0];
    const path = url.replace(/^\/api\//, '');
    const route = path.split('/')[0];
    const action = req.method.toLowerCase();
    const actionKey = `${route}:${action}`;

    // Allow public paths
    if (this.publicPaths.includes(path)) return next();

    // Check hardcoded permissions first
    const allowedActions = [
      ...(hardcodedPermissions[ALL_USER] ?? []),
      ...(hardcodedPermissions[user.role] ?? []),
    ];

    if (
      allowedActions.includes(actionKey) ||
      allowedActions.includes(`${route}:*`)
    ) {
      return next();
    }

    // Fallback to DB check
    const hasPermission = await this.rbacEntity.findOne({
      where: {
        role: { name: role },
        route: { name: route },
        permission: { name: action },
      },
      relations: ['role', 'route', 'permission'],
    });

    if (!hasPermission) {
      throw new ForbiddenException(
        `Unauthorized: ${role} doesn't have ${route} ${action} permission.`,
      );
    }

    next();
  }
}
