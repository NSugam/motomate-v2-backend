import {
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserFilterType } from 'src/common/common.type';
import { IdDTO, optionalPagiSearchTermDTO } from 'src/common/dto';
import { OrmWhereType } from 'src/common/orm.type';
import { GetUser, UserFilter } from 'src/decorators/get-user.decorator';
import { ILike } from 'typeorm';
import { LoggedInUser } from '../user/user.type';
import { UploadImageDto } from './dto/upload.dto';
import { Upload } from './entities/upload.entity';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('my-vehicle-image')
  findAll(
    @Query() { searchTerm, ...pagination }: optionalPagiSearchTermDTO,
    @UserFilter() { userId, vehicleId }: UserFilterType,
  ) {
    const filter: OrmWhereType<Upload> = { userId, vehicleId };

    if (searchTerm) filter.fileName = ILike(`%${searchTerm}%`);
    if (vehicleId) filter.vehicleId = vehicleId;

    return this.uploadService.findAndCount(
      filter,
      [],
      pagination,
      {
        createdAt: 'DESC',
      },
      [],
    );
  }

  @Post('image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadImageDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadAndSave(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: LoggedInUser,
  ) {
    return this.uploadService.uploadAndSave(file, user);
  }

  @Delete(':id')
  async delete(@Query() { id }: IdDTO, @GetUser() user: LoggedInUser) {
    return this.uploadService.deleteUpload(id, user);
  }
}
