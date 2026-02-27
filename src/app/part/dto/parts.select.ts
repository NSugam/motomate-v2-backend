import { Part } from '../entities/part.entity';

export const partsRelations: (keyof Part)[] = ['partReminder'];

export const partsSelectFields = {
  id: true,
  createdAt: true,
  name: true,
  description: true,
};

export const partsSelectWithRelation = {
  ...partsSelectFields,
  partReminder: {
    id: true,
    type: true,
    odoInterval: true,
    dateInterval: true,
  },
};
