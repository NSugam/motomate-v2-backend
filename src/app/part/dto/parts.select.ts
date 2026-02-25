import { Part } from '../entities/part.entity';

export const partsRelations: (keyof Part)[] = [
  'partsChangedRecords',
  'partReminder',
];

export const partsSelectFields = {
  id: true,
  createdAt: true,
  name: true,
  description: true,
};

export const partsSelectWithRelation = {
  ...partsSelectFields,
  partsChangedRecords: {
    id: true,
    cost: true,
    odoReading: true,
    englishDate: true,
    nepaliDate: true,
    fromServicing: true,
  },
  partReminder: {
    id: true,
    type: true,
    odoInterval: true,
    dateInterval: true,
  },
};
