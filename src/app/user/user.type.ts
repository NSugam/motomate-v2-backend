import { Vehicle } from '../vehicle/entities/vehicle.entity';

export enum UserRoleENUM {
  SUPER_ADMIN = 'super_admin',
  MANAGER = 'manager',
  ADMIN = 'admin',
  USER = 'user',
}

export interface LoggedInUser {
  id: string;
  defaultVehicleId: string;
  defaultVehicle?: Vehicle;
  fullname: string;
  username: string;
  email: string;
  verified: boolean;
  role?: UserRoleENUM;
  vehicles?: Vehicle[];
  ExpoToken?: string;
}
