export const partsChangedRelations = {
  part: {
    partReminder: true,
  },
  servicing: true,
};

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
    partReminder: {
      id: true,
      type: true,
      odoInterval: true,
      dateInterval: true,
    },
  },
  servicing: {
    id: true,
    counter: true,
    englishDate: true,
    nepaliDate: true,
    odoReading: true,
  },
};
