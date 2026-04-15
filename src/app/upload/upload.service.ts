import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v2 as cloudinaryType, UploadApiResponse } from 'cloudinary';
import { FindAndCountFn } from 'src/common/orm.type';
import { generateTakeSkip } from 'src/helper/utils';
import { Repository } from 'typeorm';
import { LoggedInUser } from '../user/user.type';
import { Upload } from './entities/upload.entity';
import { UploadFormatENUM, UploadTypeENUM } from './upload.type';

@Injectable()
export class UploadService {
  constructor(
    @Inject('CLOUDINARY')
    private readonly cloudinary: typeof cloudinaryType,

    @InjectRepository(Upload)
    private readonly uploadRepo: Repository<Upload>,
  ) {}

  async uploadAndSave(file: Express.Multer.File, user: LoggedInUser) {
    const result = await this.uploadImage(file);
    const saved = await this.uploadToDatabase(result, user);
    return saved;
  }

  findAndCount: FindAndCountFn<Upload> = (w, s, p, o, r) => {
    const { take, skip } = generateTakeSkip(p);
    return this.uploadRepo.findAndCount({
      where: w,
      select: s,
      relations: r,
      order: o,
      take,
      skip,
    });
  };

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        { folder: 'uploads' },
        (error, result) => {
          if (error) {
            return reject(
              new Error(error.message || 'Cloudinary upload failed'),
            );
          }

          if (!result) {
            return reject(new Error('No result from Cloudinary'));
          }

          resolve(result);
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async uploadToDatabase(result: UploadApiResponse, user: LoggedInUser) {
    const type =
      result.resource_type === 'image'
        ? UploadTypeENUM.IMAGE
        : result.resource_type === 'video'
          ? UploadTypeENUM.VIDEO
          : UploadTypeENUM.DOCUMENT;

    const format = this.mapFormat(result.format);

    const upload = this.uploadRepo.create({
      fileName: result.original_filename,
      url: result.secure_url,
      publicId: result.public_id,
      type,
      format,
      userId: user.id,
      vehicleId: user.defaultVehicleId,
    });

    return this.uploadRepo.save(upload);
  }

  async deleteUpload(id: string, user: LoggedInUser) {
    const upload = await this.uploadRepo.findOne({
      where: { id, userId: user.id, vehicleId: user.defaultVehicleId },
    });

    if (!upload) {
      throw new NotFoundException('File not found');
    }
    await this.cloudinary.uploader.destroy(upload.publicId);
    await this.uploadRepo.delete(id);

    return {
      message: 'File deleted successfully',
    };
  }

  private mapFormat(format: string): UploadFormatENUM {
    const normalized = format.toLowerCase();

    if (
      Object.values(UploadFormatENUM).includes(normalized as UploadFormatENUM)
    ) {
      return normalized as UploadFormatENUM;
    }

    return UploadFormatENUM.JPG;
  }
}
