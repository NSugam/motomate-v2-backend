import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindAndCountFn, FindOneFn, FindOrFailFn } from 'src/common/orm.type';
import { generateTakeSkip } from 'src/helper/utils';
import { Repository } from 'typeorm';
import { Part } from '../part/entities/part.entity';
import { LoggedInUser } from '../user/user.type';
import {
  CreatePartsReminderDTO,
  UpdatePartsReminderDTO,
} from './dto/parts-reminder.dto';
import { ReminderTypeENUM } from './dto/reminder.types';
import { PartsReminder } from './entities/parts-reminder.entity';

@Injectable()
export class PartsReminderService {
  constructor(
    @InjectRepository(PartsReminder)
    private readonly reminderRepo: Repository<PartsReminder>,

    @InjectRepository(Part)
    private readonly partRepo: Repository<Part>,
  ) {}

  async create(payload: CreatePartsReminderDTO, user: LoggedInUser) {
    const part = await this.partRepo.findOneOrFail({
      where: { id: payload.partId },
    });

    const data = this.reminderRepo.create({
      part,
      type: payload.type,
      odoInterval: payload.odoInterval,
      dateInterval: payload.dateInterval,
      userId: user.id,
      vehicleId: user.defaultVehicleId,
    });

    const saved = await this.reminderRepo.save(data);
    return { message: 'Parts Reminder Added Successfully', id: saved.id };
  }

  findOne: FindOneFn<PartsReminder> = (where, select, relations) => {
    return this.reminderRepo.findOne({ where, select, relations });
  };

  findOrFail: FindOrFailFn<PartsReminder> = async (
    where,
    select = [],
    relations = [],
  ) => {
    return this.reminderRepo.findOneOrFail({ where, select, relations });
  };

  findAndCount: FindAndCountFn<PartsReminder> = (w, s, p, o, r) => {
    const { take, skip } = generateTakeSkip(p);
    return this.reminderRepo.findAndCount({
      where: w,
      select: s,
      relations: r,
      order: o,
      take,
      skip,
    });
  };

  async update(id: string, payload: UpdatePartsReminderDTO, userId: string) {
    const data = await this.findOrFail({ id, userId });

    if (payload.type) data.type = payload.type;
    if (payload.odoInterval !== undefined)
      data.odoInterval = payload.odoInterval;
    if (payload.dateInterval !== undefined)
      data.dateInterval = payload.dateInterval;

    if (payload.type === ReminderTypeENUM.BOTH) {
      data.odoInterval = payload.odoInterval;
      data.dateInterval = payload.dateInterval;
    } else {
      data.odoInterval =
        payload.type === ReminderTypeENUM.ODO ? payload.odoInterval : null;
      data.dateInterval =
        payload.type === ReminderTypeENUM.DATE ? payload.dateInterval : null;
    }

    await this.reminderRepo.save(data);
    return { message: 'Parts Reminder Updated Successfully' };
  }

  async delete(id: string, userId: string) {
    const reminder = await this.findOrFail({ id, userId }, [], ['part']);

    //unlink relation from Part
    if (reminder.part) {
      reminder.part.partReminder = null;
      await this.partRepo.save(reminder.part);
    }

    await this.reminderRepo.remove(reminder);

    return { message: 'Parts Reminder Deleted Successfully' };
  }
}
