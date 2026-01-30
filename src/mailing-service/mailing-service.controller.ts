import { Controller, Post, Body } from '@nestjs/common';
import { MailingServiceService } from './mailing-service.service';
import { sendMailDto } from './dto/sendMail.dto';

@Controller('mailing-service')
export class MailingServiceController {
  constructor(private readonly mailingServiceService: MailingServiceService) {}

  @Post('send')
  sendMail(@Body() sendMailDto: sendMailDto) {
    return this.mailingServiceService.sendMail(sendMailDto);
  }
}
