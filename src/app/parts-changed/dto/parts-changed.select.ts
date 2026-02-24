import { PartsChanged } from '../entities/parts-changed.entity';

export const partsChangedRelations: (keyof PartsChanged)[] = [
  'part',
  'servicing',
];

export const partsChangedSelectFields = {
  id: true,
  createdAt: true,
  odoReading: true,
  englishDate: true,
  nepaliDate: true,
  cost: true,
  fromServicing: true,
  part: {
    id: true,
    name: true,
    description: true,
  },
  servicing: {
    id: true,
    counter: true,
    englishDate: true,
    nepaliDate: true,
    odoReading: true,
  },
};
