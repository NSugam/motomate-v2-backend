import { v2 as cloudinary } from 'cloudinary';
import { Provider } from '@nestjs/common';
import { env } from './env';

export const CloudinaryProvider: Provider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });

    return cloudinary;
  },
};
