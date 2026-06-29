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
  browser: UAParser.IBrowser;
  os: UAParser.IOS;
  device: UAParser.IDevice;
  ip: string;
};
