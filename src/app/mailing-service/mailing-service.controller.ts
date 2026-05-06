import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { sendMailDto } from './dto/sendMail.dto';
import { MailingService } from './mailing-service.service';

@Controller('mailing-service')
@UseGuards(ThrottlerGuard)
export class MailingServiceController {
  constructor(private readonly mailingService: MailingService) {}

  @Post('send')
  @Throttle({ default: { limit: 2, ttl: 5 * 60 * 1000 } }) // 2 request per 5 mins
  @ApiOperation({ summary: 'For testing only' })
  sendMail(@Body() sendMailDto: sendMailDto) {
    return this.mailingService.sendMail(sendMailDto);
  }
}
