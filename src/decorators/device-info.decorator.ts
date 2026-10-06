import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import * as UAParser from 'ua-parser-js';

export const DeviceInfo = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const parser = new UAParser.UAParser(req.headers['user-agent']);
    // const headerDeviceId = req.headers['deviceId'];
    const headerDeviceId = req.header('deviceid');
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();
    const deviceName =
      [device.vendor, device.model].filter(Boolean).join(' ') ||
      [browser.name, os.name].filter(Boolean).join(' on ') ||
      'Unknown device';

    return {
      browser,
      deviceId: headerDeviceId ?? null,
      deviceName,
      os,
      device,
      ip: req.ip,
    };
  },
);
