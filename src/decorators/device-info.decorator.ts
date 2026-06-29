import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import * as UAParser from 'ua-parser-js';

export const DeviceInfo = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const parser = new UAParser.UAParser(req.headers['user-agent']);

    return {
      browser: parser.getBrowser(),
      os: parser.getOS(),
      device: parser.getDevice(),
      ip: req.ip,
    };
  },
);
