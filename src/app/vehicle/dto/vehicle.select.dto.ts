import { Vehicle } from '../entities/vehicle.entity';

export const vehicleRelations: (keyof Vehicle)[] = [];

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
  ...vehicleSelectFields,
};
