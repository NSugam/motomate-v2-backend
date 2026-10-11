export type OrderType = 'ASC' | 'DESC';
export type OptionalNumberType = number | null | undefined;
export type PlainErrMsgType = string;
export type ListErrMsgType = string[];
export type ObjectErrMsgType = Record<'message', string | string[]>;

export type UserFilterType = {
  userId: string;
  vehicleId: string;
  currentOdo?: number;
};

export type DeviceInfoType = {
  browser: UAParser.IBrowser | null;
  device: UAParser.IDevice;
  deviceId: string | null;
  deviceName: string;
  manufacturer?: string | null;
  modelName?: string | null;
  brand?: string | null;
  os: UAParser.IOS;
  osName?: string | null;
  osVersion?: string | null;
  ip: string;
};
