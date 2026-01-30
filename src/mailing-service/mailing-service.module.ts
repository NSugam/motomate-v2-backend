import { Module } from '@nestjs/common';
import { MailingServiceController } from './mailing-service.controller';
import { MailingServiceService } from './mailing-service.service';

@Module({
  controllers: [MailingServiceController],
  providers: [MailingServiceService],
})
export class MailingServiceModule {}
