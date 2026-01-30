import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/decorators/get-user.decorator';
import { LoggedInUser } from '../user/user.type';
import { BulkDeleteRbacDto, BulkRbacDto, RbacDto } from './dto/rbac.dto';
import { RbacService } from './rbac.service';

@ApiTags('RBAC Manager')
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('/my')
  my(@GetUser() user: LoggedInUser) {
    return this.rbacService.my(user);
  }

  @Get('/all')
  findAll(@Query() QueryRbacDto: RbacDto) {
    return this.rbacService.findAll(QueryRbacDto);
  }

  @Post()
  create(@Body() body: RbacDto) {
    return this.rbacService.create(body);
  }

  @Put('/bulk')
  update(@Body() body: BulkRbacDto) {
    return this.rbacService.replaceAll(body.items);
  }

  @Delete('/bulk')
  bulkDelete(@Body() body: BulkDeleteRbacDto) {
    return this.rbacService.bulkDelete(body.ids);
  }
}
