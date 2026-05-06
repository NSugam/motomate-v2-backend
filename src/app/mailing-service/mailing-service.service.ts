import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { sendMail } from 'src/helper/sendMail';
import { sendMailDto } from './dto/sendMail.dto';

@Injectable()
export class MailingService {
  async sendMail(sendMailDto: sendMailDto) {
    try {
      await sendMail({
        email: sendMailDto.email,
        subject: sendMailDto.subject,
        text: sendMailDto.message,
        html: sendMailDto.message,
      });

      return {
        message: `Mail sent to: ${sendMailDto.email}`,
        statusCode: HttpStatus.OK,
        success: true,
      };
    } catch {
      throw new InternalServerErrorException('Mail Server Error');
    }
  }
}
