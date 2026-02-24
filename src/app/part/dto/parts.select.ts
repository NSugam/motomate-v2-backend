import { Part } from '../entities/part.entity';

export const partsChangedRelations: (keyof Part)[] = ['partsChangedRecords'];

export const partsChangedSelectFields = {
  id: true,
  createdAt: true,
  name: true,
  description: true,
  cost: true,
  part: {
    id: true,
    name: true,
    description: true,
  },
};
