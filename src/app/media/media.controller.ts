import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { IdDTO } from 'src/common/dto';
import { GetUser } from 'src/decorators/get-user.decorator';
import { LoggedInUser } from '../user/user.type';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @Post()
  @Throttle({ default: { ttl: 10000, limit: 290 } })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: LoggedInUser,
  ) {
    return this.mediaService.handleFileUpload(file, user);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['files'],
    },
  })
  @Post('uploads')
  @Throttle({ default: { ttl: 10000, limit: 290 } })
  @UseInterceptors(FilesInterceptor('files'))
  uploadMultipleFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @GetUser() user: LoggedInUser,
  ) {
    return this.mediaService.handleMultipleFileUpload(files, user);
  }

  @Get(':id')
  getById(@Param() { id }: IdDTO) {
    return this.mediaService.getById(id);
  }
}
