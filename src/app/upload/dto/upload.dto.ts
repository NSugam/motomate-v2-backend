import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to upload',
  })
  file: any;
}

export class DeleteCloudinaryImageDto {
  @ApiProperty({ description: 'Cloudinary public ID of the image to delete' })
  @IsString()
  @IsNotEmpty()
  publicId: string;
}
