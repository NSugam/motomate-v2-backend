import { partsChangedSelectFields } from 'src/app/parts-changed/dto/parts-changed.select';

export const servicingRelations = {
  partsChanged: {
    part: true,
  },
};

export const servicingSelectFields = {
  id: true,
  createdAt: true,
  location: true,
  counter: true,
  servicingCost: true,
  totalCostWithParts: true,
  odoReading: true,
  englishDate: true,
  nepaliDate: true,
  remarks: true,
};

export const servicingSelectWithRelation = {
  ...servicingSelectFields,
  partsChanged: partsChangedSelectFields,
};
