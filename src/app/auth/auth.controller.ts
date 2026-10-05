import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { DeviceInfoType } from 'src/common/common.type';
import { DeviceInfo } from 'src/decorators/device-info.decorator';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './data/dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() newUser: CreateUserDto) {
    return this.authService.createUser(newUser);
  }

  @Post('login')
  login(
    @Body() user: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
    @DeviceInfo() deviceInfo: DeviceInfoType,
  ) {
    return this.authService.login(user, res, deviceInfo);
  }

  @Post('logout')
  logout(@Res() res: Response) {
    return this.authService.logout(res);
  }
}
