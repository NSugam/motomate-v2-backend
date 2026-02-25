import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ILike } from 'typeorm';

import { UserFilterType } from 'src/common/common.type';
import { IdDTO, optionalPagiSearchTermDTO } from 'src/common/dto';
import { GetUser, UserFilter } from 'src/decorators/get-user.decorator';

import { OrmWhereType } from 'src/common/orm.type';
import { LoggedInUser } from '../user/user.type';
import {
  CreatePartsReminderDTO,
  UpdatePartsReminderDTO,
} from './dto/parts-reminder.dto';
import {
  partsReminderRelations,
  partsReminderSelectWithRelation,
} from './dto/parts-reminder.select';
import { PartsReminder } from './entities/parts-reminder.entity';
import { PartsReminderService } from './parts-reminder.service';

@Controller('parts-reminder')
export class PartsReminderController {
  constructor(private readonly reminderService: PartsReminderService) {}

  @Get('my')
  findAll(
    @Query() { searchTerm, ...pagination }: optionalPagiSearchTermDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    const filter: OrmWhereType<PartsReminder> = { userId, vehicleId };
    if (searchTerm) filter.part = { name: ILike(`%${searchTerm}%`) };

    return this.reminderService.findAndCount(
      filter,
      partsReminderSelectWithRelation,
      pagination,
      { createdAt: 'DESC' },
      partsReminderRelations,
    );
  }

  @Get(':id')
  findOne(@Param() { id }: IdDTO, @UserFilter() { userId }: UserFilterType) {
    return this.reminderService.findOrFail({ id, userId }, [], ['part']);
  }

  @Post()
  create(@Body() body: CreatePartsReminderDTO, @GetUser() user: LoggedInUser) {
    return this.reminderService.create(body, user);
  }

  @Patch(':id')
  update(
    @Param() { id }: IdDTO,
    @Body() body: UpdatePartsReminderDTO,
    @UserFilter() { userId }: UserFilterType,
  ) {
    return this.reminderService.update(id, body, userId);
  }

  @Delete(':id')
  delete(@Param() { id }: IdDTO, @UserFilter() { userId }: UserFilterType) {
    return this.reminderService.delete(id, userId);
  }
}
