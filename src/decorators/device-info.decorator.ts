import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { DeviceInfoType } from 'src/common/common.type';
import * as UAParser from 'ua-parser-js';

interface EncodedDeviceInfo {
  deviceId?: string | null;
  deviceName?: string | null;
  manufacturer?: string | null;
  modelName?: string | null;
  osName?: string | null;
  osVersion?: string | null;
  brand?: string | null;
}

export const DeviceInfo = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): DeviceInfoType => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const parser = new UAParser.UAParser(req.headers['user-agent'] ?? '');

    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    let deviceInfo: EncodedDeviceInfo | null = null;

    try {
      const encoded = req.header('X-Device-Info');

      if (encoded) {
        const parsed: unknown = JSON.parse(
          Buffer.from(encoded, 'base64').toString('utf-8'),
        );

        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          !Array.isArray(parsed)
        ) {
          deviceInfo = parsed as EncodedDeviceInfo;
        }
      }
    } catch {
      // Fall back to user-agent information.
    }

    const manufacturer = deviceInfo?.manufacturer ?? device.vendor ?? null;
    const modelName = deviceInfo?.modelName ?? device.model ?? null;
    const osName = deviceInfo?.osName ?? os.name ?? null;
    const osVersion = deviceInfo?.osVersion ?? os.version ?? null;

    return {
      browser: deviceInfo ? null : browser,
      device: {
        ...device,
        vendor: manufacturer ?? undefined,
        model: modelName ?? undefined,
      },
      deviceId: deviceInfo?.deviceId ?? req.header('deviceid') ?? null,
      deviceName:
        deviceInfo?.deviceName ??
        ([manufacturer, modelName].filter(Boolean).join(' ') ||
          [browser.name, osName].filter(Boolean).join(' on ') ||
          'Unknown device'),
      manufacturer,
      modelName,
      brand: deviceInfo?.brand ?? manufacturer,
      os: {
        ...os,
        name: osName ?? undefined,
        version: osVersion ?? undefined,
      },
      osName,
      osVersion,
      ip: req.ip ?? '',
    };
  },
);
