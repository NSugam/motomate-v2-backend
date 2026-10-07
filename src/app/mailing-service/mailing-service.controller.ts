import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { sendMailDto } from './dto/sendMail.dto';
import { MailingService } from './mailing-service.service';

@Controller('mailing-service')
export class MailingServiceController {
  constructor(private readonly mailingService: MailingService) {}

  @Post('send')
  @ApiOperation({ summary: 'For testing only' })
  sendMail(@Body() sendMailDto: sendMailDto) {
    return this.mailingService.sendMail(sendMailDto);
  }
}
