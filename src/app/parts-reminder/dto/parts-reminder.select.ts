import { partsSelectFields } from 'src/app/part/dto/parts.select';
import { PartsReminder } from '../entities/parts-reminder.entity';

export const partsReminderRelations: (keyof PartsReminder)[] = ['part'];

export const partsReminderSelectFields = {
  id: true,
  createdAt: true,
  type: true,
  odoInterval: true,
  dateInterval: true,
};

export const partsReminderSelectWithRelation = {
  ...partsReminderSelectFields,
  part: partsSelectFields,
};
