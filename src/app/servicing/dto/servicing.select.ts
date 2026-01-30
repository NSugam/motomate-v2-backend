import { partsSelectFields } from 'src/app/parts-changed/dto/parts.select';
import { Servicing } from '../entities/servicing.entity';

export const servicingRelations: (keyof Servicing)[] = ['partsChanged'];

export const servicingSelectFields = {
  id: true,
  userId: true,
  createdAt: true,
  location: true,
  counter: true,
  totalCost: true,
  odoReading: true,
  englishDate: true,
  nepaliDate: true,
  remarks: true,
};

export const servicingSelectWithRelation = {
  ...servicingSelectFields,
  partsChanged: partsSelectFields,
};
