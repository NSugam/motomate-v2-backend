import { Repository } from 'typeorm';
import { Fillups } from './entities/fillup.entity';

export async function recalcDistanceAndMileage(
  repository: Repository<Fillups>,
  previous: Fillups | null,
  current: Fillups,
) {
  let distance: number | null = null;
  let mileage: number | null = null;

  if (previous) {
    distance = Number(current.odoReading) - Number(previous.odoReading);

    // Only calculate mileage if previous fillup has valid mileage and neither is partial
    if (distance > 0 && !current.isPartial && !previous.isPartial) {
      mileage = distance / current.quantity;
    }

    if (current.isPartial || previous.isPartial) {
      mileage = null;
    }
  }

  current.distance = distance;
  current.mileage = mileage;

  await repository.save(current);
}
