import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/app/user/entities/user.entity';
import { RequestWithUser } from 'src/config/CustomRequest';
import { env } from 'src/config/env';
import { Repository } from 'typeorm';
import {
  userRelations,
  userSelectWithRelation,
} from '../app/user/dto/user.select.dto';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(User)
    private readonly userEntity: Repository<User>,
  ) {}

  async use(req: RequestWithUser, _res: Response, next: NextFunction) {
    const token = req.cookies._xf_;
    if (!token)
      throw new UnauthorizedException('Unauthorized: Please login to continue');

    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };

    const user = await this.userEntity.findOne({
      where: { id: decoded.userId },
      select: userSelectWithRelation,
      relations: userRelations,
    });

    if (!user)
      throw new UnauthorizedException('Unauthorized: Invalid User Credentials');

    req.user = user;
    next();
  }
}
