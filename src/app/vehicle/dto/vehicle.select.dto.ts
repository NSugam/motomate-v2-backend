import { Vehicle } from '../entities/vehicle.entity';
import { FindOptionsRelations } from 'typeorm';

export const vehicleRelations: FindOptionsRelations<Vehicle> = {
  masterData: true,
  vehicleImage: true,
  shareDetails: {
    sharedWith: true,
  },
};

export const vehicleSelectFields = {
  id: true,
  createdAt: true,
  brand: true,
  model: true,
  licensePlate: true,
  cc: true,
  odoReading: true,
  year: true,
  afe: true,
  nepaliDate: true,
  englishDate: true,
  soldEnglishDate: true,
  soldNepaliDate: true,
  vehicleImage: {
    id: true,
    url: true,
    type: true,
  },
};

export const vehicleSelectWithRelation = {
  id: true,
  createdAt: true,
  brand: true,
  model: true,
  licensePlate: true,
  cc: true,
  odoReading: true,
  year: true,
  afe: true,
  nepaliDate: true,
  englishDate: true,
  soldEnglishDate: true,
  soldNepaliDate: true,
  masterData: {
    id: true,
    engine: true,
    displacement: true,
    power: true,
    torque: true,
    cooling: true,
    total_weight: true,
  },
  shareDetails: {
    id: true,
    vehicleId: true,
    sharedByUserId: true,
    permission: true,
    status: true,
    createdAt: true,
    sharedWith: {
      id: true,
      fullname: true,
      username: true,
      email: true,
    },
  },
  vehicleImage: {
    id: true,
    url: true,
    type: true,
  },
};
