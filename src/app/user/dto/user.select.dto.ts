import { vehicleSelectFields } from 'src/app/vehicle/dto/vehicle.select.dto';
import { User } from '../entities/user.entity';

export const userRelations: (keyof User)[] = ['vehicles'];

export const userSelectFields = {
  id: true,
  createdAt: true,
  defaultVehicleId: true,
  fullname: true,
  username: true,
  phone: true,
  email: true,
  role: true,
};

export const userSelectWithRelation = {
  ...userSelectFields,
  vehicles: vehicleSelectFields,
};
