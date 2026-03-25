import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { UserFilterType } from 'src/common/common.type';
import { OrmWhereType } from 'src/common/orm.type';
import { GetUser, UserFilter } from 'src/decorators/get-user.decorator';
import { ILike } from 'typeorm';
import { RoleDto } from './dto/role-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { userRelations, userSelectWithRelation } from './dto/user.select.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { LoggedInUser } from './user.type';

@Controller('user')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Get('me')
  getProfile(@GetUser() user: LoggedInUser) {
    return this.usersService.getProfile(user);
  }

  @Patch('me')
  updateUser(
    @Body() updateDetails: UpdateUserDto,
    @UserFilter() { userId }: UserFilterType,
  ) {
    return this.usersService.update(userId, updateDetails);
  }

  @Get()
  findAll(
    @Query() { searchTerm, role, ...pagination }: RoleDto,
    @UserFilter() { userId }: UserFilterType,
  ) {
    const filter: OrmWhereType<User> = { id: userId };
    if (searchTerm) filter.fullname = ILike(`%${searchTerm}%`);
    if (role) filter.role = role;

    return this.usersService.findAndCount(
      filter,
      userSelectWithRelation,
      pagination,
      {
        createdAt: 'DESC',
      },
      userRelations,
    );
  }

  @Get(':id')
  findById(@Param('id') id: string, @UserFilter() { userId }: UserFilterType) {
    return this.usersService.findOrFail(
      { id: userId ? userId : id },
      userSelectWithRelation,
      userRelations,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDetails: UpdateUserDto,
    @UserFilter() { userId }: UserFilterType,
  ) {
    return this.usersService.update(userId ? userId : id, updateDetails);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @UserFilter() { userId }: UserFilterType) {
    return this.usersService.deleteById(userId ? userId : id);
  }
}
