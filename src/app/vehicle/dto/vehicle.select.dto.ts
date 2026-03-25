import { Vehicle } from '../entities/vehicle.entity';

export const vehicleRelations: (keyof Vehicle)[] = ['masterData'];

export const vehicleSelectFields = {
  id: true,
  createdAt: true,
  brand: true,
  model: true,
  cc: true,
  odoReading: true,
  year: true,
  afe: true,
  nepaliDate: true,
  englishDate: true,
};

export const vehicleSelectWithRelation = {
  id: true,
  createdAt: true,
  brand: true,
  model: true,
  cc: true,
  odoReading: true,
  year: true,
  afe: true,
  nepaliDate: true,
  englishDate: true,
  masterData: {
    engine: true,
    displacement: true,
    power: true,
    torque: true,
    cooling: true,
    total_weight: true,
  },
};
