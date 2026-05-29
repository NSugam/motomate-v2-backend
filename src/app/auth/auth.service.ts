import {
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { env } from 'src/config/env';
import { EntityManager, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserRoleENUM } from '../user/user.type';
import { CreateUserDto, LoginUserDto } from './data/dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userEntity: Repository<User>,

    private readonly entityManager: EntityManager,
  ) {}

  cookieOptions = {
    httpOnly: true,
    secure: env.isProd ? true : false, // true for swagger and production, false for react-native(local)
    sameSite: 'none' as const,
    path: '/',
  };

  async createUser(payload: CreateUserDto) {
    const existingUser = await this.userEntity.findOne({
      where: [{ username: payload.username }, { email: payload.email }],
    });

    if (existingUser) {
      throw new ConflictException(
        existingUser.username === payload.username
          ? 'Username already exists'
          : 'Email address already exists',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(payload.password, salt);

    const newUser = this.userEntity.create({
      ...payload,
      password: hashedPassword,
      role: UserRoleENUM.USER,
    });

    await this.entityManager.save(newUser);

    return true;
  }

  async login(user: LoginUserDto, res: Response) {
    const JWT_SECRET = env.JWT_SECRET;

    const userData = await this.userEntity.findOne({
      where: { email: user.email },
    });
    if (!userData) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(user.password, userData.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const token = jwt.sign({ userId: userData.id }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('_xf_', token, {
      ...this.cookieOptions,
      maxAge: user.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000, // 1 week or 1 hour
    });

    const expiryTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const formattedExpiryTime = expiryTime.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kathmandu',
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = userData;
    return {
      loggedInUser: userWithoutPassword,
      expiryTime: formattedExpiryTime,
    };
  }

  logout(res: Response) {
    res.cookie('_xf_', '', {
      ...this.cookieOptions,
      expires: new Date(0),
    });

    return res
      .status(HttpStatus.OK)
      .json({ message: 'Account Logged Out', success: true });
  }
}
