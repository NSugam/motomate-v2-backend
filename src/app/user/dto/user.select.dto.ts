import { vehicleSelectFields } from 'src/app/vehicle/dto/vehicle.select.dto';

export const userRelations = {
  vehicles: true,
  defaultVehicle: {
    masterData: true,
  },
};

export const userSelectFields = {
  id: true,
  createdAt: true,
  defaultVehicleId: true,
  fullname: true,
  username: true,
  phone: true,
  email: true,
  verified: true,
  role: true,
  ExpoToken: true,
};

export const userSelectWithRelation = {
  ...userSelectFields,
  vehicles: vehicleSelectFields,
  defaultVehicle: {
    ...vehicleSelectFields,
    masterData: {
      engine: true,
      displacement: true,
      power: true,
      torque: true,
      cooling: true,
      total_weight: true,
    },
  },
};
