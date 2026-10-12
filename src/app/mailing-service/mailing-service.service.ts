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
    console.time('[MailingService] Email delivery');

    try {
      console.log('[MailingService] Starting email delivery');

      await sendMail({
        email: sendMailDto.email,
        subject: sendMailDto.subject,
        text: sendMailDto.message,
        html: sendMailDto.message,
      });

      console.log('[MailingService] Email delivery completed');

      return {
        message: `Mail sent to: ${sendMailDto.email}`,
        statusCode: HttpStatus.OK,
        success: true,
      };
    } catch (error) {
      console.error('[MailingService] Email delivery failed:', error);

      throw new InternalServerErrorException('Mail Server Error');
    } finally {
      console.timeEnd('[MailingService] Email delivery');
    }
  }
}
