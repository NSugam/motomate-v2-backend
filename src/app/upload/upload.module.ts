import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudinaryProvider } from 'src/config/cloudinary.config';
import { Upload } from './entities/upload.entity';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([Upload])],
  controllers: [UploadController],
  providers: [UploadService, CloudinaryProvider],
  exports: [UploadService, CloudinaryProvider],
})
export class UploadModule {}
