import { vehicleSelectWithRelation } from 'src/app/vehicle/dto/vehicle.select.dto';

export const sharedVehicleSelect = {
  id: true,
  vehicle: { ...vehicleSelectWithRelation },
  permission: true,
  status: true,
  createdAt: true,
  sharedWith: {
    id: true,
    fullname: true,
    username: true,
    email: true,
  },
  sharedBy: {
    id: true,
    fullname: true,
    username: true,
    email: true,
  },
};

export const sharedVehicleRelations = {
  vehicle: {
    vehicleImage: true,
    masterData: true,
  },
  sharedWith: true,
  sharedBy: true,
};
